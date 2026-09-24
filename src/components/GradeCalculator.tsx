import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  RotateCcw,
  Sparkles,
  Copy,
  Share2,
  FileDown,
  History,
  X,
  FileText,
} from 'lucide-react';
import { ToolHeading } from './ToolHeading';
import {
  INITIAL_ASSESSMENTS,
  LOCAL_STORAGE_HISTORY_KEY,
  GRADING_SCALES,
} from '../data/constants';
import {
  AssessmentItem,
  CalculationMode,
  GradeHistoryItem,
  GradingScaleType,
  ValidatedAssessment,
} from '../types';
import {
  getGradeRemark,
  getLetterFromPercent,
  parseNumber,
} from '../utils/formatters';
import { useHistory } from '../context/HistoryContext';

const CalculationTrendChart = React.lazy(() =>
  import('./CalculationTrendChart').then((m) => ({ default: m.CalculationTrendChart }))
);

interface GradeCalculatorProps {
  setToast: (msg: string) => void;
}

export const GradeCalculator: React.FC<GradeCalculatorProps> = ({ setToast }) => {
  const { addHistoryItem, history: unifiedHistory } = useHistory();
  const [historyView, setHistoryView] = useState<'chart' | 'list'>('list');
  const [courseName, setCourseName] = useState<string>('Biology 101');
  const [studentName, setStudentName] = useState<string>('');
  const [showPdfMeta, setShowPdfMeta] = useState<boolean>(false);
  const [assessments, setAssessments] = useState<AssessmentItem[]>(INITIAL_ASSESSMENTS);
  const [mode, setMode] = useState<CalculationMode>('points');
  const [scale, setScale] = useState<GradingScaleType>('standard');
  const [history, setHistory] = useState<GradeHistoryItem[]>([]);
  const [currentGrade, setCurrentGrade] = useState<{ percent: number; letter: string }>({
    percent: 87.7,
    letter: 'B',
  });
  const [whatIfEarned, setWhatIfEarned] = useState<string>('95');
  const [whatIfPossible, setWhatIfPossible] = useState<string>('100');
  const [whatIfWeight, setWhatIfWeight] = useState<string>('15');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load calculation history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      setHistory([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync calculation history to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
      } catch {
        // Ignore storage errors in sandbox
      }
    }
  }, [history, isLoaded]);

  // Validate assessment rows
  const validatedAssessments: ValidatedAssessment[] = useMemo(() => {
    return assessments.map((item) => {
      const scoreNum = parseNumber(item.score);
      const maxNum = parseNumber(item.max);
      const weightNum = parseNumber(item.weight);
      const hasName = Boolean(item.name.trim());
      const hasScores = item.score !== '' && item.max !== '';
      const validPoints = maxNum > 0 && scoreNum >= 0 && scoreNum <= maxNum;
      const validWeight = mode !== 'weighted' || (item.weight !== '' && weightNum > 0);

      const invalid = !hasName || !hasScores || !validPoints || !validWeight;

      return {
        ...item,
        scoreNum,
        maxNum,
        weightNum,
        invalid,
      };
    });
  }, [assessments, mode]);

  const hasAnyErrors = validatedAssessments.some((item) => item.invalid);

  // Generic calculation logic
  const calculateResult = (items: ValidatedAssessment[]): number => {
    const validItems = items.filter((item) => !item.invalid);
    if (!validItems.length) return 0;

    if (mode === 'weighted') {
      const totalWeight = validItems.reduce((acc, curr) => acc + curr.weightNum, 0);
      if (totalWeight <= 0) return 0;
      const weightedSum = validItems.reduce(
        (acc, curr) => acc + (curr.scoreNum / curr.maxNum) * curr.weightNum,
        0
      );
      return (weightedSum / totalWeight) * 100;
    }

    const totalPossible = validItems.reduce((acc, curr) => acc + curr.maxNum, 0);
    if (totalPossible <= 0) return 0;
    const totalEarned = validItems.reduce((acc, curr) => acc + curr.scoreNum, 0);
    return (totalEarned / totalPossible) * 100;
  };

  const currentLetter = getLetterFromPercent(currentGrade.percent, scale);

  const handleUpdateAssessment = (
    id: number,
    field: keyof AssessmentItem,
    value: string
  ) => {
    setAssessments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddAssessment = () => {
    setAssessments((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: '',
        score: '',
        max: '100',
        weight: '10',
      },
    ]);
  };

  const handleRemoveAssessment = (id: number) => {
    setAssessments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReset = () => {
    setAssessments(INITIAL_ASSESSMENTS.map((item) => ({ ...item })));
    setMode('points');
    setCurrentGrade({ percent: 87.7, letter: 'B' });
    setWhatIfEarned('95');
    setWhatIfPossible('100');
    setWhatIfWeight('15');
    setToast('Calculator reset.');
  };

  const handleCalculate = () => {
    if (hasAnyErrors) {
      setToast('Check the highlighted assessment rows first.');
      return;
    }

    const finalPercent = calculateResult(validatedAssessments);
    const finalLetter = getLetterFromPercent(finalPercent, scale);
    const resultObj = { percent: finalPercent, letter: finalLetter };

    setCurrentGrade(resultObj);
    setHistory((prev) => [
      {
        id: Date.now(),
        percent: finalPercent,
        letter: finalLetter,
        mode,
        count: assessments.length,
        createdAt: new Date().toISOString(),
      },
      ...prev.slice(0, 7),
    ]);

    addHistoryItem({
      type: 'quick',
      title: 'Grade Calculation',
      value: `${finalPercent.toFixed(1)}% (${finalLetter})`,
      subtitle: `${courseName || 'Course'} · ${mode === 'weighted' ? 'Weighted' : 'Points'} mode · ${assessments.length} assessments`,
      details: {
        score: Number(finalPercent.toFixed(1)),
        letter: finalLetter,
        mode,
        assessmentsCount: assessments.length,
        courseName: courseName || 'General Course',
      },
    });

    setToast('Calculation saved to your recent history.');
  };

  // Live what-if score calculation
  const whatIfResult = useMemo(() => {
    const earnedVal = parseNumber(whatIfEarned);
    const possibleVal = parseNumber(whatIfPossible);
    const weightVal = parseNumber(whatIfWeight);

    if (
      whatIfEarned === '' ||
      whatIfPossible === '' ||
      possibleVal <= 0 ||
      earnedVal < 0 ||
      earnedVal > possibleVal
    ) {
      return null;
    }

    const tempItem: ValidatedAssessment = {
      id: 999999,
      name: 'What if',
      score: whatIfEarned,
      max: whatIfPossible,
      weight: whatIfWeight,
      scoreNum: earnedVal,
      maxNum: possibleVal,
      weightNum: weightVal,
      invalid: false,
    };

    const validExisting = validatedAssessments.filter((item) => !item.invalid);
    return calculateResult([...validExisting, tempItem]);
  }, [whatIfEarned, whatIfPossible, whatIfWeight, mode, validatedAssessments]);

  const handleCopyGrade = async () => {
    try {
      await navigator.clipboard.writeText(
        `My current grade is ${currentGrade.percent.toFixed(1)}% (${currentLetter}) — calculated with Easy Grade.`
      );
      setToast('Result copied to your clipboard.');
    } catch {
      setToast('Copy is unavailable in this browser.');
    }
  };

  const handleShareGrade = async () => {
    const shareText = `My current grade is ${currentGrade.percent.toFixed(1)}% (${currentLetter}).`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My current grade',
          text: shareText,
        });
        setToast('Result shared.');
      } catch {
        // User cancelled share
      }
    } else {
      await handleCopyGrade();
    }
  };

  const handleExportPdf = async () => {
    if (hasAnyErrors) {
      setToast('Check the highlighted assessment rows before exporting.');
      return;
    }

    try {
      const { exportGradeReportPdf } = await import('../utils/pdfExport');
      exportGradeReportPdf({
        courseName: courseName.trim() || 'Coursework',
        studentName: studentName.trim() || undefined,
        mode,
        scale,
        percent: currentGrade.percent,
        letter: currentLetter,
        assessments: validatedAssessments,
        whatIf:
          whatIfResult !== null
            ? {
                earned: whatIfEarned,
                possible: whatIfPossible,
                weight: mode === 'weighted' ? whatIfWeight : undefined,
                projectedPercent: whatIfResult,
                projectedLetter: getLetterFromPercent(whatIfResult, scale),
              }
            : null,
      });
      setToast('PDF grade report generated and downloaded.');
    } catch (err) {
      console.error('PDF export failed:', err);
      setToast('Could not generate PDF. Please try again.');
    }
  };

  if (!isLoaded) {
    return <div className="tool-loading">Loading your saved calculations…</div>;
  }

  return (
    <>
      <ToolHeading
        eyebrow="Quick grade"
        title={
          <>
            Know where you stand.
            <br />
            <em>Plan your next move.</em>
          </>
        }
        copy="Add your assessments, get the percentage that matters, and test the scores you are aiming for. No account, no spreadsheet gymnastics."
      />

      <section className="calculator-grid" aria-label="Grade calculator">
        {/* Left Input Panel */}
        <div className="tool-card input-panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Your assessments</h2>
              <p className="panel-subtitle">Enter points earned and possible for each item.</p>
            </div>

            <div className="mode-switch" aria-label="Calculator mode">
              <button
                type="button"
                data-active={mode === 'points'}
                onClick={() => setMode('points')}
              >
                Points
              </button>
              <button
                type="button"
                data-active={mode === 'weighted'}
                onClick={() => setMode('weighted')}
              >
                Weighted
              </button>
            </div>
          </div>

          <div className={`table-head ${mode === 'weighted' ? 'weighted-head' : ''}`}>
            <span>Assessment</span>
            <span>Earned</span>
            <span>Possible</span>
            {mode === 'weighted' && <span>Weight</span>}
            <span />
          </div>

          {assessments.map((item, index) => {
            const rowVal = validatedAssessments[index];
            return (
              <div
                key={item.id}
                className={`assessment-row ${mode === 'weighted' ? 'weighted' : ''} ${
                  rowVal?.invalid ? 'invalid' : ''
                }`}
              >
                <input
                  className="field-input"
                  value={item.name}
                  onChange={(e) => handleUpdateAssessment(item.id, 'name', e.target.value)}
                  placeholder="e.g. Quiz 1"
                  aria-label={`Assessment ${index + 1} name`}
                />
                <input
                  className="field-input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={item.score}
                  onChange={(e) => handleUpdateAssessment(item.id, 'score', e.target.value)}
                  placeholder="0"
                  aria-label={`${item.name || 'Assessment'} earned`}
                />
                <input
                  className="field-input"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  value={item.max}
                  onChange={(e) => handleUpdateAssessment(item.id, 'max', e.target.value)}
                  placeholder="100"
                  aria-label={`${item.name || 'Assessment'} possible`}
                />
                {mode === 'weighted' && (
                  <input
                    className="field-input"
                    type="number"
                    inputMode="decimal"
                    min="1"
                    value={item.weight}
                    onChange={(e) => handleUpdateAssessment(item.id, 'weight', e.target.value)}
                    placeholder="Weight"
                    aria-label={`${item.name || 'Assessment'} weight`}
                  />
                )}
                <button
                  type="button"
                  className="remove-button"
                  disabled={assessments.length === 1}
                  onClick={() => handleRemoveAssessment(item.id)}
                  aria-label={`Remove ${item.name || 'assessment'}`}
                >
                  <X aria-hidden="true" />
                </button>

                {rowVal?.invalid && (
                  <div className="row-error">
                    {!item.name.trim()
                      ? 'Give this assessment a name.'
                      : item.score === '' || item.max === ''
                      ? 'Add both scores to continue.'
                      : rowVal.maxNum <= 0 || rowVal.scoreNum < 0 || rowVal.scoreNum > rowVal.maxNum
                      ? 'Earned points must be between 0 and possible points.'
                      : 'Weight must be greater than 0.'}
                  </div>
                )}
              </div>
            );
          })}

          {mode === 'weighted' && (
            <p className="weight-hint">
              Weights are relative shares. They do not need to add up to exactly 100.
            </p>
          )}

          <button type="button" className="add-button" onClick={handleAddAssessment}>
            <Plus aria-hidden="true" /> Add assessment
          </button>

          <div className="panel-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={handleReset}
            >
              <RotateCcw aria-hidden="true" /> Reset
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={handleCalculate}
            >
              <Sparkles aria-hidden="true" /> Calculate grade
            </button>
          </div>
        </div>

        {/* Right Result Panel & What-if */}
        <div>
          <div className="result-panel">
            <div className="result-kicker">Current grade</div>
            <div className="result-percent">
              {currentGrade.percent.toFixed(1)}
              <span>%</span>
            </div>

            <div className="result-letter">
              <span>{currentLetter}</span> {getGradeRemark(currentGrade.percent)}
            </div>

            <p className="result-message">
              This is your {mode === 'weighted' ? 'weighted' : 'points'} view of the assessments above. Change a score or add an item, then calculate again.
            </p>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, Math.max(0, currentGrade.percent))}%`,
                }}
              />
            </div>

            <div className="result-meta">
              <span>0</span>
              <span>100%</span>
            </div>

            <hr className="result-divider" />

            <div className="result-actions">
              <button
                type="button"
                className="result-action"
                onClick={handleCopyGrade}
              >
                <Copy aria-hidden="true" /> Copy
              </button>
              <button
                type="button"
                className="result-action"
                onClick={handleShareGrade}
              >
                <Share2 aria-hidden="true" /> Share
              </button>
              <button
                type="button"
                className="result-action result-action-highlight"
                onClick={handleExportPdf}
                title="Download formatted PDF grade report"
              >
                <FileDown aria-hidden="true" /> Export PDF
              </button>
            </div>

            <div className="pdf-custom-toggle">
              <button
                type="button"
                onClick={() => setShowPdfMeta(!showPdfMeta)}
                aria-expanded={showPdfMeta}
              >
                <FileText aria-hidden="true" />
                <span>{showPdfMeta ? 'Hide PDF report details' : 'Customize PDF report details (course / name)'}</span>
              </button>

              {showPdfMeta && (
                <div className="pdf-custom-inputs">
                  <div>
                    <label htmlFor="pdf-course-name">Course / Subject</label>
                    <input
                      id="pdf-course-name"
                      className="field-input"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="e.g. Biology 101"
                    />
                  </div>
                  <div>
                    <label htmlFor="pdf-student-name">Student Name (Optional)</label>
                    <input
                      id="pdf-student-name"
                      className="field-input"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* What-If Card */}
          <div className="what-if">
            <div className="what-if-head">
              <div className="what-if-title">Try a what-if score</div>
              <span className="what-if-badge">Explore</span>
            </div>
            <p className="what-if-copy">
              Add one hypothetical assessment to see where your average could land.
            </p>

            <div className="what-if-fields">
              <input
                className="field-input"
                type="number"
                inputMode="decimal"
                min="0"
                value={whatIfEarned}
                onChange={(e) => setWhatIfEarned(e.target.value)}
                placeholder="Earned"
                aria-label="What-if points earned"
              />
              <input
                className="field-input"
                type="number"
                inputMode="decimal"
                min="1"
                value={whatIfPossible}
                onChange={(e) => setWhatIfPossible(e.target.value)}
                placeholder="Possible"
                aria-label="What-if points possible"
              />
            </div>

            {mode === 'weighted' && (
              <input
                className="field-input"
                type="number"
                inputMode="decimal"
                min="1"
                value={whatIfWeight}
                onChange={(e) => setWhatIfWeight(e.target.value)}
                placeholder="Weight"
                aria-label="What-if weight"
                style={{ marginTop: 8 }}
              />
            )}

            <div className="what-if-result">
              <strong>
                {whatIfResult === null ? '—' : `${whatIfResult.toFixed(1)}%`}
              </strong>
              <span>
                {whatIfResult === null
                  ? 'Enter a valid score'
                  : `would be a ${getLetterFromPercent(whatIfResult, scale)}`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Below Grid: History & Grading Scale */}
      <section className="below-grid">
        {/* Recent Calculations History & Trend Visualizer */}
        <div className="tool-card history-panel">
          <div className="history-head" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="panel-title">Calculation Trend & History</h2>
              <p className="panel-subtitle">Visual fluctuation of your grade averages over time.</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="mode-switch">
                <button
                  type="button"
                  data-active={historyView === 'chart'}
                  onClick={() => setHistoryView('chart')}
                >
                  Trend Chart
                </button>
                <button
                  type="button"
                  data-active={historyView === 'list'}
                  onClick={() => setHistoryView('list')}
                >
                  List
                </button>
              </div>

              {history.length > 0 && historyView === 'list' && (
                <button
                  type="button"
                  className="history-clear"
                  onClick={() => {
                    setHistory([]);
                    setToast('Recent calculations cleared.');
                  }}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {historyView === 'chart' ? (
            <React.Suspense
              fallback={
                <div style={{ height: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Loading trajectory chart...</span>
                </div>
              }
            >
              <CalculationTrendChart
                history={unifiedHistory}
                defaultView="grade"
                height={230}
              />
            </React.Suspense>
          ) : history.length === 0 ? (
            <div className="empty-history">
              <History aria-hidden="true" />
              <p>
                No saved calculations yet.
                <br />
                Your next result will show up here.
              </p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-grade">{item.letter}</div>
                  <div>
                    <div className="history-name">{item.percent.toFixed(1)}% average</div>
                    <div className="history-detail">
                      {item.mode === 'weighted' ? 'Weighted' : 'Points'} · {item.count} assessments ·{' '}
                      {new Intl.DateTimeFormat('en', {
                        month: 'short',
                        day: 'numeric',
                      }).format(new Date(item.createdAt))}
                    </div>
                  </div>
                  <div className="history-score">{item.letter}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grading Scale Panel */}
        <div className="tool-card scale-panel">
          <h2 className="panel-title">Grading scale</h2>
          <p className="panel-subtitle">Choose the reference that matches your class.</p>

          <div className="scale-tabs">
            <button
              type="button"
              className="scale-tab"
              data-active={scale === 'standard'}
              onClick={() => setScale('standard')}
            >
              Standard
            </button>
            <button
              type="button"
              className="scale-tab"
              data-active={scale === 'plus'}
              onClick={() => setScale('plus')}
            >
              Plus / minus
            </button>
          </div>

          <div className="scale-list">
            {GRADING_SCALES[scale].map((gradeItem) => (
              <div key={gradeItem.letter} className="scale-row">
                <span className="scale-letter">{gradeItem.letter}</span>
                <div className="scale-bar">
                  <span
                    style={{
                      width: `${gradeItem.min}%`,
                      background: gradeItem.color,
                    }}
                  />
                </div>
                <span className="scale-range">
                  {gradeItem.min}%{gradeItem.min === 0 ? '↓' : '+'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
