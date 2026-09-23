import React, { useState } from 'react';
import { Plus, X, FileDown, History } from 'lucide-react';
import { ToolHeading } from './ToolHeading';
import { GRADE_POINT_MAP, INITIAL_COURSES } from '../data/constants';
import { CourseItem } from '../types';
import { parseNumber } from '../utils/formatters';
import { exportGpaReportPdf } from '../utils/pdfExport';
import { useHistory } from '../context/HistoryContext';

interface GpaCalculatorProps {
  setToast?: (msg: string) => void;
}

export const GpaCalculator: React.FC<GpaCalculatorProps> = ({ setToast }) => {
  const { addHistoryItem } = useHistory();
  const [courses, setCourses] = useState<CourseItem[]>(INITIAL_COURSES);

  const totalCredits = courses.reduce(
    (acc, curr) => acc + parseNumber(curr.credits),
    0
  );

  const totalQualityPoints = courses.reduce(
    (acc, curr) =>
      acc + parseNumber(curr.credits) * (GRADE_POINT_MAP[curr.grade] ?? 0),
    0
  );

  const currentGpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;

  const handleUpdateCourse = (
    id: number,
    field: keyof CourseItem,
    value: string
  ) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleAddCourse = () => {
    setCourses((prev) => [
      ...prev,
      { id: Date.now(), name: '', credits: '3', grade: 'A' },
    ]);
  };

  const handleRemoveCourse = (id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const getGpaComment = (gpa: number) => {
    if (gpa >= 3.5) return 'Excellent standing. Your consistency is showing.';
    if (gpa >= 3.0) return 'Good standing. Keep building momentum.';
    return 'There is room to lift this with your next class.';
  };

  return (
    <>
      <ToolHeading
        eyebrow="GPA calculator"
        title={
          <>
            Turn course work
            <br />
            <em>into one clear number.</em>
          </>
        }
        copy="Add your classes, enter each credit value, and see your semester GPA on a 4.0 scale."
      />

      <div className="tool-layout">
        <div className="tool-card">
          <div className="tool-card-head">
            <div>
              <h2 className="panel-title">Your courses</h2>
              <p className="panel-subtitle">Credits make high-hour classes count proportionally.</p>
            </div>
            <span className="tool-badge">4.0 scale</span>
          </div>

          <div className="course-head">
            <span>Course</span>
            <span>Credits</span>
            <span>Grade</span>
            <span />
          </div>

          {courses.map((course) => (
            <div key={course.id} className="course-row">
              <input
                className="tool-input"
                value={course.name}
                onChange={(e) => handleUpdateCourse(course.id, 'name', e.target.value)}
                placeholder="Course name"
                aria-label={`${course.name || 'Course'} name`}
              />
              <input
                className="tool-input"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={course.credits}
                onChange={(e) => handleUpdateCourse(course.id, 'credits', e.target.value)}
                aria-label={`${course.name || 'Course'} credits`}
              />
              <select
                className="tool-input"
                value={course.grade}
                onChange={(e) => handleUpdateCourse(course.id, 'grade', e.target.value)}
                aria-label={`${course.name || 'Course'} grade`}
              >
                {Object.keys(GRADE_POINT_MAP).map((letter) => (
                  <option key={letter} value={letter}>
                    {letter}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="remove-button"
                aria-label={`Remove ${course.name || 'course'}`}
                disabled={courses.length === 1}
                onClick={() => handleRemoveCourse(course.id)}
              >
                <X aria-hidden="true" />
              </button>
            </div>
          ))}

          <button type="button" className="add-button" onClick={handleAddCourse}>
            <Plus aria-hidden="true" /> Add course
          </button>
        </div>

        <div className="tool-card tool-result-card">
          <span className="result-kicker">Current GPA</span>
          <div className="tool-big-number">
            {currentGpa.toFixed(2)}
            <small>/ 4.0</small>
          </div>
          <p className="tool-result-copy">{getGpaComment(currentGpa)}</p>

          <div className="metric-grid">
            <div>
              <strong>{totalCredits.toFixed(1)}</strong>
              <span>Total credits</span>
            </div>
            <div>
              <strong>{courses.length}</strong>
              <span>Courses</span>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'grid', gap: '8px' }}>
            <button
              type="button"
              className="result-action"
              style={{ width: '100%' }}
              onClick={() => {
                addHistoryItem({
                  type: 'gpa',
                  title: 'GPA Calculation',
                  value: `${currentGpa.toFixed(2)} / 4.0`,
                  subtitle: `${courses.length} courses · ${totalCredits.toFixed(1)} credits`,
                });
                setToast?.('GPA calculation saved to history.');
              }}
            >
              <History aria-hidden="true" /> Save to History
            </button>

            <button
              type="button"
              className="result-action result-action-highlight"
              style={{ width: '100%' }}
              onClick={() => {
                try {
                  exportGpaReportPdf({
                    gpa: currentGpa,
                    totalCredits,
                    courses,
                  });
                  addHistoryItem({
                    type: 'gpa',
                    title: 'GPA Transcript Export',
                    value: `${currentGpa.toFixed(2)} / 4.0`,
                    subtitle: `${courses.length} courses · ${totalCredits.toFixed(1)} credits`,
                  });
                  setToast?.('GPA PDF transcript generated and downloaded.');
                } catch {
                  setToast?.('Could not export GPA PDF.');
                }
              }}
            >
              <FileDown aria-hidden="true" /> Export GPA PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
