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
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
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
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedCounter } from './AnimatedCounter';

const CalculationTrendChart = React.lazy(() =>
  import('./CalculationTrendChart').then((m) => ({ default: m.CalculationTrendChart }))
);

const TARGET_PRESETS = [
  { label: 'A (93%)', value: '93' },
  { label: 'A- (90%)', value: '90' },
  { label: 'B+ (87%)', value: '87' },
  { label: 'B (83%)', value: '83' },
  { label: 'B- (80%)', value: '80' },
  { label: 'C (75%)', value: '75' },
];

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
  const [targetGrade, setTargetGrade] = useState<string>('90');
  const [upcomingName, setUpcomingName] = useState<string>('Upcoming Exam');
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
    setTargetGrade('90');
    setUpcomingName('Upcoming Exam');
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
    const parsedTarget = parseNumber(targetGrade);
    const validTarget = targetGrade.trim() !== '' && !isNaN(parsedTarget) && parsedTarget > 0 ? parsedTarget : undefined;

    setCurrentGrade(resultObj);
    setHistory((prev) => [
      {
        id: Date.now(),
        percent: finalPercent,
        letter: finalLetter,
        mode,
        count: assessments.length,
        createdAt: new Date().toISOString(),
        targetGrade: validTarget,
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
        targetGrade: validTarget,
      },
    });

    setToast('Calculation saved to your recent history.');
  };

  // Target Grade numerical and letter resolution
  const targetGradeNum = useMemo(() => {
    const val = parseNumber(targetGrade);
    return targetGrade.trim() !== '' && !isNaN(val) && val > 0 ? val : null;
  }, [targetGrade]);

  const targetLetter = useMemo(() => {
    if (targetGradeNum === null) return '';
    return getLetterFromPercent(targetGradeNum, scale);
  }, [targetGradeNum, scale]);

  // Live what-if score calculation
  const whatIfResult = useMemo(() => {
    const earnedVal = parseNumber(whatIfEarned);
    const possibleVal = parseNumber(whatIfPossible);
    const weightVal = parseNumber(whatIfWeight);

    if (
      whatIfEarned === '' ||
      whatIfPossible === '' ||
      possibleVal <= 0 ||
      earnedVal < 0
    ) {
      return null;
    }

    const tempItem: ValidatedAssessment = {
      id: 999999,
      name: upcomingName.trim() || 'Upcoming',
      score: whatIfEarned,
      max: whatIfPossible,
      weight: whatIfWeight,
      scoreNum: earnedVal,
      maxNum: possibleVal,
      weightNum: weightVal > 0 ? weightVal : 1,
      invalid: false,
    };

    const validExisting = validatedAssessments.filter((item) => !item.invalid);
    return calculateResult([...validExisting, tempItem]);
  }, [whatIfEarned, whatIfPossible, whatIfWeight, upcomingName, mode, validatedAssessments]);

  // Impact delta compared to current base grade
  const impactDelta = useMemo(() => {
    if (whatIfResult === null) return null;
    return Number((whatIfResult - currentGrade.percent).toFixed(1));
  }, [whatIfResult, currentGrade.percent]);

  // Comparison to target grade
  const targetComparison = useMemo(() => {
    if (whatIfResult === null || targetGradeNum === null) return null;
    const gap = Number((whatIfResult - targetGradeNum).toFixed(1));
    const isMet = whatIfResult >= targetGradeNum;
    return { gap, isMet };
  }, [whatIfResult, targetGradeNum]);

  // Required score on upcoming assignment to reach target grade
  const requiredScoreAdvice = useMemo(() => {
    if (targetGradeNum === null) return null;
    const possibleVal = parseNumber(whatIfPossible);
    if (whatIfPossible === '' || possibleVal <= 0) return null;

    const validExisting = validatedAssessments.filter((item) => !item.invalid);
    if (!validExisting.length) return null;
    const targetFraction = targetGradeNum / 100;

    let neededScore = 0;
    let neededPercent = 0;

    if (mode === 'weighted') {
      const weightVal = parseNumber(whatIfWeight);
      if (whatIfWeight === '' || weightVal <= 0) return null;

      const totalWeight = validExisting.reduce((acc, curr) => acc + curr.weightNum, 0);
      const weightedSum = validExisting.reduce(
        (acc, curr) => acc + (curr.scoreNum / curr.maxNum) * curr.weightNum,
        0
      );

      // (weightedSum + (neededScore / possibleVal) * weightVal) / (totalWeight + weightVal) = targetFraction
      const neededFraction = (targetFraction * (totalWeight + weightVal) - weightedSum) / weightVal;
      neededScore = neededFraction * possibleVal;
      neededPercent = neededFraction * 100;
    } else {
      const totalEarned = validExisting.reduce((acc, curr) => acc + curr.scoreNum, 0);
      const totalPossible = validExisting.reduce((acc, curr) => acc + curr.maxNum, 0);

      neededScore = targetFraction * (totalPossible + possibleVal) - totalEarned;
      neededPercent = (neededScore / possibleVal) * 100;
    }

    const shortSummary =
      neededScore <= 0
        ? `Target ${targetGradeNum}% already secured`
        : `${neededScore.toFixed(1)} / ${possibleVal} (${neededPercent.toFixed(1)}%)`;

    return {
      neededScore,
      neededPercent,
      possibleVal,
      alreadyAchieved: neededScore <= 0,
      extraCreditNeeded: neededScore > possibleVal,
      shortSummary,
    };
  }, [targetGradeNum, whatIfPossible, whatIfWeight, mode, validatedAssessments]);

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
        targetGrade: targetGradeNum !== null ? String(targetGradeNum) : undefined,
        assessments: validatedAssessments,
        whatIf:
          whatIfResult !== null
            ? {
                earned: whatIfEarned,
                possible: whatIfPossible,
                weight: mode === 'weighted' ? whatIfWeight : undefined,
                projectedPercent: whatIfResult,
                projectedLetter: getLetterFromPercent(whatIfResult, scale),
                targetGrade: targetGradeNum !== null ? String(targetGradeNum) : undefined,
                impactDelta: impactDelta !== null ? impactDelta : undefined,
                neededScore: requiredScoreAdvice ? requiredScoreAdvice.shortSummary : undefined,
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
              <AnimatedCounter value={currentGrade.percent} decimals={1} duration={350} />
              <span>%</span>
            </div>

            <div className="result-letter">
              <span className="result-letter-badge">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentLetter}
                    initial={{ opacity: 0, y: -4, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.92 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {currentLetter}
                  </motion.span>
                </AnimatePresence>
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentLetter}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {getGradeRemark(currentGrade.percent)}
                </motion.span>
              </AnimatePresence>
            </div>

            <p className="result-message">
              This is your {mode === 'weighted' ? 'weighted' : 'points'} view of the assessments above. Change a score or add an item, then calculate again.
            </p>

            <div className="progress-track" style={{ position: 'relative' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, Math.max(0, currentGrade.percent))}%`,
                }}
              />
              {targetGradeNum !== null && targetGradeNum >= 0 && targetGradeNum <= 100 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    bottom: '-2px',
                    left: `${targetGradeNum}%`,
                    width: '2px',
                    background: '#f59e0b',
                    zIndex: 2,
                    boxShadow: '0 0 4px rgba(245, 158, 11, 0.7)',
                  }}
                  title={`Target: ${targetGradeNum}%`}
                />
              )}
            </div>

            <div className="result-meta">
              <span>0%</span>
              {targetGradeNum !== null && (
                <span style={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}>
                  Target: {targetGradeNum}% ({targetLetter})
                </span>
              )}
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

          {/* Target Grade & Upcoming Assignment Simulator */}
          <div className="target-simulator-card" aria-label="Target Grade and Upcoming Assignment Simulator">
            <div className="target-simulator-head">
              <div>
                <div className="target-simulator-title">
                  <Target style={{ width: 17, height: 17, color: 'hsl(var(--tool-primary))' }} aria-hidden="true" />
                  <span>Target Grade & Upcoming Assignment</span>
                </div>
                <p className="what-if-copy" style={{ margin: '4px 0 0' }}>
                  Set your desired final grade and test how a hypothetical score on an upcoming test or assignment impacts your cumulative grade.
                </p>
              </div>
              <span className="target-simulator-badge">Simulator</span>
            </div>

            {/* Target Grade Section */}
            <div className="target-input-section">
              <div className="target-label-row">
                <label htmlFor="target-grade-input" className="target-label">
                  <Target style={{ width: 13, height: 13, color: 'hsl(var(--tool-primary))' }} aria-hidden="true" />
                  Target Final Grade
                </label>
                {targetGradeNum !== null && (
                  <span className="target-letter-badge">
                    Goal: {targetGradeNum}% ({targetLetter})
                  </span>
                )}
              </div>

              <div className="target-input-wrap">
                <input
                  id="target-grade-input"
                  className="target-input-field"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="150"
                  step="0.5"
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  placeholder="e.g. 90"
                  aria-label="Target final grade percentage"
                />
                <span className="target-input-unit">%</span>
              </div>

              <div className="target-presets-row">
                {TARGET_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    className="target-preset-chip"
                    data-active={targetGrade === preset.value}
                    onClick={() => setTargetGrade(preset.value)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Upcoming Assignment Inputs */}
            <div className="upcoming-section">
              <div>
                <label htmlFor="upcoming-name-input" className="upcoming-label">
                  Upcoming Assessment Name
                </label>
                <input
                  id="upcoming-name-input"
                  className="field-input"
                  value={upcomingName}
                  onChange={(e) => setUpcomingName(e.target.value)}
                  placeholder="e.g. Final Exam, Essay 3"
                  aria-label="Upcoming assessment name"
                />
              </div>

              <div className="upcoming-fields-grid">
                <div>
                  <label htmlFor="what-if-earned" className="upcoming-label">
                    Hypothetical Earned
                  </label>
                  <input
                    id="what-if-earned"
                    className="field-input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={whatIfEarned}
                    onChange={(e) => setWhatIfEarned(e.target.value)}
                    placeholder="Earned"
                    aria-label="Hypothetical points earned"
                  />
                </div>
                <div>
                  <label htmlFor="what-if-possible" className="upcoming-label">
                    Total Possible
                  </label>
                  <input
                    id="what-if-possible"
                    className="field-input"
                    type="number"
                    inputMode="decimal"
                    min="1"
                    value={whatIfPossible}
                    onChange={(e) => setWhatIfPossible(e.target.value)}
                    placeholder="Possible"
                    aria-label="Hypothetical points possible"
                  />
                </div>
              </div>

              {mode === 'weighted' && (
                <div>
                  <label htmlFor="what-if-weight" className="upcoming-label">
                    Assignment Weight / Share
                  </label>
                  <input
                    id="what-if-weight"
                    className="field-input"
                    type="number"
                    inputMode="decimal"
                    min="1"
                    value={whatIfWeight}
                    onChange={(e) => setWhatIfWeight(e.target.value)}
                    placeholder="e.g. 20"
                    aria-label="Hypothetical assignment weight"
                  />
                </div>
              )}

              {/* Interactive Score Slider */}
              {parseNumber(whatIfPossible) > 0 && (
                <div className="slider-control-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
                      Adjust hypothetical score
                    </span>
                    <span className="slider-pct-tag">
                      {parseNumber(whatIfPossible) > 0 ? (
                        <>
                          <AnimatedCounter
                            value={(parseNumber(whatIfEarned) / parseNumber(whatIfPossible)) * 100}
                            decimals={0}
                            duration={160}
                          />
                          %
                        </>
                      ) : (
                        ''
                      )}
                    </span>
                  </div>
                  <div className="slider-track-wrap">
                    <input
                      type="range"
                      className="score-range-slider"
                      min="0"
                      max={Math.max(parseNumber(whatIfPossible), 10)}
                      step="0.5"
                      value={parseNumber(whatIfEarned) || 0}
                      onChange={(e) => setWhatIfEarned(e.target.value)}
                      aria-label="Score adjustment slider"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Live Simulation & Impact Results */}
            <div className="simulation-results-box">
              <div className="projected-grade-row">
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--app-font-mono)' }}>
                    Projected Final Grade
                  </div>
                  <div className="projected-grade-val">
                    <span className="projected-percent-number">
                      {whatIfResult === null ? (
                        '—'
                      ) : (
                        <>
                          <AnimatedCounter value={whatIfResult} decimals={1} duration={300} />
                          <span style={{ fontSize: '18px', marginLeft: '2px', opacity: 0.85 }}>%</span>
                        </>
                      )}
                    </span>
                    {whatIfResult !== null && (
                      <span className="projected-letter-tag">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={getLetterFromPercent(whatIfResult, scale)}
                            initial={{ opacity: 0, scale: 0.88 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.88 }}
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          >
                            {getLetterFromPercent(whatIfResult, scale)}
                          </motion.span>
                        </AnimatePresence>
                      </span>
                    )}
                  </div>
                </div>

                {impactDelta !== null && (
                  <motion.div
                    key={`delta-${impactDelta > 0 ? 'pos' : impactDelta < 0 ? 'neg' : 'neu'}`}
                    initial={{ opacity: 0.75, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className={`impact-delta-tag ${
                      impactDelta > 0
                        ? 'impact-positive'
                        : impactDelta < 0
                        ? 'impact-negative'
                        : 'impact-neutral'
                    }`}
                    title={`Current: ${currentGrade.percent.toFixed(1)}% → Projected: ${whatIfResult?.toFixed(1)}%`}
                  >
                    {impactDelta > 0 ? (
                      <TrendingUp style={{ width: 14, height: 14 }} aria-hidden="true" />
                    ) : impactDelta < 0 ? (
                      <TrendingDown style={{ width: 14, height: 14 }} aria-hidden="true" />
                    ) : null}
                    <span>
                      {impactDelta > 0 ? '+' : ''}
                      <AnimatedCounter value={impactDelta} decimals={1} duration={250} />%
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Impact Narrative */}
              {impactDelta !== null && whatIfResult !== null && (
                <div style={{ fontSize: '11.5px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.4 }}>
                  {impactDelta > 0 ? (
                    <>
                      This score raises your cumulative grade by <strong style={{ color: 'hsl(var(--foreground))' }}>+{impactDelta.toFixed(1)}%</strong> (from {currentGrade.percent.toFixed(1)}% to {whatIfResult.toFixed(1)}%).
                    </>
                  ) : impactDelta < 0 ? (
                    <>
                      This score lowers your cumulative grade by <strong style={{ color: 'hsl(var(--foreground))' }}>{impactDelta.toFixed(1)}%</strong> (from {currentGrade.percent.toFixed(1)}% to {whatIfResult.toFixed(1)}%).
                    </>
                  ) : (
                    <>
                      This score matches your current standing and keeps your cumulative average at {currentGrade.percent.toFixed(1)}%.
                    </>
                  )}
                </div>
              )}

              {/* Target Comparison Feedback */}
              {targetComparison !== null && targetGradeNum !== null && (
                <div
                  className={`target-feedback-box ${
                    targetComparison.isMet ? 'target-feedback-success' : 'target-feedback-warning'
                  }`}
                >
                  {targetComparison.isMet ? (
                    <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                  ) : (
                    <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                  )}
                  <div>
                    {targetComparison.isMet ? (
                      <>
                        <strong>Target Achieved!</strong> With this score, your projected grade ({whatIfResult?.toFixed(1)}%) meets or exceeds your {targetGradeNum}% ({targetLetter}) goal by +{targetComparison.gap.toFixed(1)}%.
                      </>
                    ) : (
                      <>
                        <strong>Below Target:</strong> With this score, your projected grade ({whatIfResult?.toFixed(1)}%) is {Math.abs(targetComparison.gap).toFixed(1)}% below your {targetGradeNum}% ({targetLetter}) goal.
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Score Needed Solver */}
              {requiredScoreAdvice !== null && targetGradeNum !== null && (
                <div className="target-needed-text">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 2, fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                    <Target style={{ width: 12, height: 12, color: 'hsl(var(--tool-primary))' }} aria-hidden="true" />
                    <span>Target Score Requirement:</span>
                  </div>
                  {requiredScoreAdvice.alreadyAchieved ? (
                    <span>
                      You have already secured your target grade of <strong>{targetGradeNum}%</strong>. Even with 0 points on this assignment, your cumulative average remains above your goal.
                    </span>
                  ) : requiredScoreAdvice.extraCreditNeeded ? (
                    <span>
                      Reaching your <strong>{targetGradeNum}% ({targetLetter})</strong> target requires at least <strong>{requiredScoreAdvice.neededScore.toFixed(1)} / {requiredScoreAdvice.possibleVal} ({requiredScoreAdvice.neededPercent.toFixed(1)}%)</strong> on this assignment (extra credit required).
                    </span>
                  ) : (
                    <span>
                      To achieve your <strong>{targetGradeNum}% ({targetLetter})</strong> target, you need at least <strong>{requiredScoreAdvice.neededScore.toFixed(1)} / {requiredScoreAdvice.possibleVal} ({requiredScoreAdvice.neededPercent.toFixed(1)}%)</strong> on this assignment.
                    </span>
                  )}
                </div>
              )}

              {/* Visual Comparison Bar */}
              {whatIfResult !== null && (
                <div className="comparison-bar-wrap">
                  <div className="comparison-track">
                    <div
                      className="comparison-fill-current"
                      style={{ width: `${Math.min(100, Math.max(0, currentGrade.percent))}%` }}
                      title={`Current grade: ${currentGrade.percent.toFixed(1)}%`}
                    />
                    <div
                      className="comparison-fill-projected"
                      style={{ width: `${Math.min(100, Math.max(0, whatIfResult))}%` }}
                      title={`Projected grade: ${whatIfResult.toFixed(1)}%`}
                    />
                    {targetGradeNum !== null && targetGradeNum >= 0 && targetGradeNum <= 100 && (
                      <div
                        className="comparison-target-needle"
                        style={{ left: `${targetGradeNum}%` }}
                        title={`Target: ${targetGradeNum}%`}
                      />
                    )}
                  </div>
                  <div className="comparison-labels-row">
                    <span>Current: {currentGrade.percent.toFixed(1)}%</span>
                    <span>Projected: {whatIfResult.toFixed(1)}%</span>
                    {targetGradeNum !== null && (
                      <span style={{ color: '#d97706', fontWeight: 600 }}>
                        Target: {targetGradeNum}%
                      </span>
                    )}
                  </div>
                </div>
              )}
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
