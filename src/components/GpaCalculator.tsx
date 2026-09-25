import React, { useState } from 'react';
import { Plus, X, FileDown, History } from 'lucide-react';
import { ToolHeading } from './ToolHeading';
import { GRADE_POINT_MAP, INITIAL_COURSES } from '../data/constants';
import { CourseItem } from '../types';
import { parseNumber } from '../utils/formatters';
import { useHistory } from '../context/HistoryContext';

const CalculationTrendChart = React.lazy(() =>
  import('./CalculationTrendChart').then((m) => ({ default: m.CalculationTrendChart }))
);

interface GpaCalculatorProps {
  setToast?: (msg: string) => void;
}

export const GpaCalculator: React.FC<GpaCalculatorProps> = ({ setToast }) => {
  const { addHistoryItem, history } = useHistory();
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
                  details: {
                    score: Number(currentGpa.toFixed(2)),
                    gpa: Number(currentGpa.toFixed(2)),
                    credits: totalCredits,
                    coursesCount: courses.length,
                  },
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
              onClick={async () => {
                try {
                  const { exportGpaReportPdf } = await import('../utils/pdfExport');
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
                    details: {
                      score: Number(currentGpa.toFixed(2)),
                      gpa: Number(currentGpa.toFixed(2)),
                      credits: totalCredits,
                      coursesCount: courses.length,
                    },
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

      {/* GPA Fluctuation Trend Analytics */}
      <div style={{ marginTop: '28px' }}>
        <React.Suspense fallback={<div style={{ height: '240px' }} />}>
          <CalculationTrendChart
            history={history}
            defaultView="gpa"
            height={240}
          />
        </React.Suspense>
      </div>

      {/* Optimized Educational & SEO Content for GPA Calculator */}
      <section className="seo-content w-full max-w-4xl mx-auto mt-12 mb-16" aria-labelledby="gpa-guide-title">
        <article className="seo-article bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-10 font-sans">
          <h1
            id="gpa-guide-title"
            className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 tracking-tight"
          >
            How to Calculate GPA: Grade Point Average for College &amp; University Registrar
          </h1>

          <div className="my-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <img
              src="https://neuroncdn.com/cdn-0001/1f9fe52f6523462565ec46b90e2f6df5d99e9f5e593ee09c6cde869ef1658a0a?ts=1790320609"
              alt="A hand holds a calculator over a paper with course names and numbers visible."
              className="w-full h-auto object-cover max-h-[460px]"
              loading="lazy"
            />
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            An essential metric for academic evaluation, the Grade Point Average (GPA) plays a pivotal role in a student&apos;s educational journey. <strong className="font-semibold text-gray-900 dark:text-white">Understanding how to calculate GPA is crucial for every college and university student, especially when considering how different countries may approach the formula, including variations in semester and cumulative calculations.</strong> This guide will demystify the GPA calculation process, providing clarity on its various aspects, including how to convert grades into a grade-point average.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Understanding GPA
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            What is GPA?
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            GPA, or Grade Point Average, is a standardized numerical representation of a student&apos;s academic achievement, playing a key role in their nc. <strong className="font-semibold text-gray-900 dark:text-white">It serves as a comprehensive metric that reflects the average of all grades earned across various courses.</strong> Each letter grade, such as an A, B, C, D, or F, is assigned a specific point value, and these grade points, including pluses and minuses, are then used in the calculation. This system allows for a consistent evaluation of a student&apos;s performance throughout their college or university enrollment, providing a clear overview of their academic standing.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Importance of Grade Point Average
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            The Grade Point Average holds significant importance for several reasons in the academic world, particularly in relation to a student&apos;s nc. <strong className="font-semibold text-gray-900 dark:text-white">A student&apos;s GPA can impact college admissions, scholarship eligibility, and even future employment opportunities, highlighting the importance of maintaining strong semester and cumulative averages.</strong> Many institutions set a minimum GPA for academic good standing, and a higher GPA often opens doors to more opportunities, such as honors programs, financial aid, or graduate school admissions, particularly when considering semester and cumulative averages. The overall GPA, or cumulative GPA, is a key indicator of a student&apos;s consistent academic performance and reflects their dedication and understanding across all their courses, as well as their ability to obtain high scores on exams.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Types of GPAs: Weighted vs. Unweighted
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            When considering how to calculate GPA, it is crucial to understand the distinction between weighted GPA and unweighted GPA, as well as how different countries may apply these concepts. <strong className="font-semibold text-gray-900 dark:text-white">An unweighted GPA calculates the grade point average on a standard 4.0 scale, where an A always equates to 4.0 grade points, regardless of the course difficulty, impacting semester and cumulative results. Conversely, a weighted GPA considers the rigor of a course, assigning additional weight to more challenging classes like AP or honors courses, which can significantly impact a student&apos;s overall nc.</strong> This means that a student might earn more quality points for an A in an AP course than for an A in a standard course, resulting in a higher GPA that better reflects their academic effort in challenging subjects.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Calculating GPA
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Step-by-Step Calculation Process
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            The process to calculate GPA involves several clear steps to ensure accuracy and reflect a student&apos;s academic achievement properly. First, it is important to gather all coursework and grade information, including semester and cumulative data, to ensure an accurate GPA calculation for nc purposes. <strong className="font-semibold text-gray-900 dark:text-white">Assign numerical grade points to each letter grade earned in a course, typically on a 4.0 GPA scale where an A is 4.0 points, B is 3.0, C is 2.0, D is 1.0, and F is 0 points associated with the cumulative GPA. Next, multiply these grade points by the number of credits for each course to determine the quality points for that course.</strong> Once you have accumulated the quality points for all courses in a semester or academic period, sum them up to get the total quality points, which you can then convert into your final GPA, affecting both semester and cumulative standings. Finally, divide this total by the total number of credits attempted during that period to arrive at the GPA, which is essential for evaluating nc.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Using a GPA Calculator
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            To simplify the calculation process and avoid manual errors, <strong className="font-semibold text-gray-900 dark:text-white">a GPA calculator can be an invaluable tool for any college or university student.</strong> This digital tool automates the steps involved in calculating the GPA, allowing students to input their letter grades and corresponding credit hours for each course. The GPA calculator then instantly performs the necessary multiplications and divisions to provide an accurate GPA, which is essential for the application process. Utilizing a GPA calculator is especially helpful when dealing with a large number of courses or when needing to project a potential GPA for future academic planning, ensuring a clear understanding of one&apos;s academic standing.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Factors Influencing GPA Calculation
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Several factors can influence the final GPA calculation, extending beyond just the simple assignment of grade points, including extracurricular activities, the application process, and their potential impact on nc. The grading system of a particular college or university, for example, might have variations in how grade points are assigned to plus or minus letter grades (e.g., A- might be 3.7 instead of a full 4.0). <strong className="font-semibold text-gray-900 dark:text-white">The weight of specific courses, such as AP or honors classes, can also lead to a weighted GPA that differs from an unweighted GPA, as these courses often earn more quality points per credit, including pluses and minuses.</strong> Additionally, the inclusion or exclusion of certain courses, like pass/fail options, can impact the overall GPA, making it essential to understand the specific academic policies of one&apos;s institution and how they relate to final grades.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            GPA and Course Grades
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Grade Points Assignment
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            The foundation of the GPA system lies in the precise assignment of grade points to each letter grade a student earns, which is essential for determining their nc. <strong className="font-semibold text-gray-900 dark:text-white">Typically, on a standard 4.0 GPA scale, an &quot;A&quot; is assigned 4.0 points, a &quot;B&quot; receives 3.0 points, a &quot;C&quot; gets 2.0 points, and a &quot;D&quot; is given 1.0 point, while an &quot;F&quot; receives 0 points; this system is crucial for understanding semester and cumulative performance.</strong> These numerical representations allow for a standardized method of evaluating academic achievement across various courses and institutions, particularly in terms of grade-point average. The accuracy of this initial assignment is crucial, as any errors here will ripple through the entire GPA calculation, affecting the student&apos;s overall academic record and potential cumulative GPA, ultimately influencing their final grade.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Quality Points Explained
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Quality points are a critical component in calculating a student&apos;s GPA, representing the value of a specific grade in a course relative to its credit load and its contribution to their nc. <strong className="font-semibold text-gray-900 dark:text-white">To determine quality points for a course, the assigned grade points for the letter grade earned, including any pluses and minuses, are multiplied by the number of credits for that course, which is crucial for calculating nc.</strong> For example, an &quot;A&quot; (4.0 grade points) in a 3-credit course would yield 12 quality points (4.0 x 3), contributing positively to the student&apos;s nc. These quality points are then summed across all courses to contribute to the total quality points, which are subsequently used to divide by the total number of credits to arrive at the final GPA, often illustrated in a chart for clarity.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Impact of Course Weight on GPA
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            The weight of a course can significantly impact a student&apos;s GPA, particularly in institutions that utilize a weighted GPA system. <strong className="font-semibold text-gray-900 dark:text-white">Courses designated as more rigorous, such as Advanced Placement (AP) or honors classes, are often assigned additional weight, meaning they contribute more quality points to the overall GPA than standard courses with the same number of credits.</strong> This weighting reflects the increased academic challenge and effort required in such courses. For instance, an &quot;A&quot; in an AP course might be assigned 5.0 grade points instead of the standard 4.0, leading to a higher GPA that better showcases a student&apos;s performance in challenging academic environments.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Cumulative GPA and Overall Performance
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            What is Cumulative GPA?
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            <strong className="font-semibold text-gray-900 dark:text-white">The cumulative GPA represents the overall academic average of a student&apos;s performance across all courses taken throughout their entire academic career at a college or university.</strong> Unlike a semester GPA, which only considers grades from a single academic period, the cumulative GPA provides a comprehensive long-term view of a student&apos;s academic achievement. It is calculated by totaling all quality points earned from every course and dividing that sum by the total number of credits attempted over all semesters of enrollment, which serves as the numerator in the GPA formula. This average GPA is a crucial metric often reviewed by the office of the university registrar, particularly in terms of semester and cumulative performance.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Tracking GPA Over Time
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            <strong className="font-semibold text-gray-900 dark:text-white">Tracking your GPA over time is a valuable practice for any student seeking to monitor their academic progress and ensure they maintain a good academic standing, especially in relation to their exam and test scores.</strong> By regularly calculating the GPA at the end of each semester, a student can observe trends in their academic performance, identify courses or periods where they struggled, and make necessary adjustments to their study habits or course load. This continuous monitoring, often facilitated by a GPA calculator, helps students understand how their current grades contribute to their cumulative GPA and aids in strategic academic planning to achieve a higher GPA.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Strategies for Improving Overall GPA
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Improving one&apos;s overall GPA requires a strategic and consistent effort across multiple academic semesters to enhance their nc. Key strategies include prioritizing courses with a higher credit weight, focusing on earning higher grade points in upcoming courses, and actively seeking academic support if needed to improve both semester and cumulative GPAs. <strong className="font-semibold text-gray-900 dark:text-white">Students should also consider retaking courses where they received a low letter grade, as many institutions allow the new grade to replace the old one in the GPA calculation, significantly boosting the overall average.</strong> Consistent study, effective time management, and understanding how each grade impacts the cumulative GPA and financial aid eligibility are essential for academic improvement and maintaining a good nc.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            GPA in College and University
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Understanding Transcripts and GPAs
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            <strong className="font-semibold text-gray-900 dark:text-white">Transcripts serve as official academic records detailing a student&apos;s entire enrollment history, including all courses taken, letter grades received, credit hours, and, critically, their GPA, which is vital for nc assessments.</strong> Both semester GPAs and the cumulative GPA are prominently featured on a transcript, providing a comprehensive overview of a student&apos;s academic achievement at the college or university, including the impact of pluses and minuses. Understanding how to read and interpret a transcript is vital, as it reflects a student&apos;s academic standing and is often required for various applications, such as transferring credits, applying for graduate programs, or even seeking employment.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            GPA Requirements for Different Programs
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            GPA requirements can vary significantly across different programs and departments within a college or university, influenced by the subject matter, grading policies, and the academic ability of students. Undergraduate programs often have a minimum GPA for admission and to maintain academic good standing, usually around a 2.0 on a 4.0 GPA scale, which is assessed through both semester and cumulative GPAs. More competitive programs, such as those in specific sciences or engineering fields, may require a higher GPA, often determined by the quality of test scores and exam performance. Similarly, certain majors might stipulate a minimum grade in core courses, which can directly influence a student&apos;s nc. <strong className="font-semibold text-gray-900 dark:text-white">Students must familiarize themselves with these specific GPA guidelines, including how pluses and minuses affect calculations, to ensure they meet the academic prerequisites for their chosen field of study.</strong>
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            GPA Guidelines for Honors and Graduate Programs
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Honors and graduate programs typically set significantly higher GPA guidelines compared to general undergraduate requirements, reflecting their increased academic rigor and selectivity. For admission to an honors program, a student might need a cumulative GPA of 3.5 or higher, which reflects their performance across various subjects, coursework, and test scores. <strong className="font-semibold text-gray-900 dark:text-white">Graduate school admissions are even more stringent, often requiring a strong undergraduate GPA, usually a 3.0 or above, and sometimes a higher GPA in specific relevant courses, as determined by the admissions formula.</strong> These programs use the higher GPA as an indicator of a student&apos;s capacity for advanced academic work and sustained intellectual commitment, showcasing their overall academic achievement and enhancing their nc.
          </p>
        </article>
      </section>
    </>
  );
};
