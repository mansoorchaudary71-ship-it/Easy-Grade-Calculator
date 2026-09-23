import { jsPDF } from 'jspdf';
import { CourseItem, ValidatedAssessment } from '../types';
import { GRADING_SCALES, GRADE_POINT_MAP } from '../data/constants';

interface GradeReportOptions {
  courseName?: string;
  studentName?: string;
  mode: 'points' | 'weighted';
  scale: 'standard' | 'plus';
  percent: number;
  letter: string;
  assessments: ValidatedAssessment[];
  whatIf?: {
    earned: string;
    possible: string;
    weight?: string;
    projectedPercent: number;
    projectedLetter: string;
  } | null;
}

export function exportGradeReportPdf(data: GradeReportOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Banner Background
  doc.setFillColor(31, 89, 80); // #1f5950 deep teal
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  // App Brand & Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('EASY GRADE CALCULATOR', margin + 8, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(220, 240, 235);
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);
  doc.text(`Official Academic Calculation Report · Generated ${dateStr}`, margin + 8, y + 18);

  y += 30;

  // Student & Course Meta Info Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('COURSE / SUBJECT:', margin + 6, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(data.courseName?.trim() || 'General Coursework', margin + 42, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('GRADING SYSTEM:', margin + 6, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const modeLabel = data.mode === 'weighted' ? 'Weighted Percentages' : 'Total Points Based';
  const scaleLabel = data.scale === 'plus' ? 'Plus / Minus Scale' : 'Standard 10-Point Scale';
  doc.text(`${modeLabel} (${scaleLabel})`, margin + 42, y + 13);

  if (data.studentName?.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('STUDENT:', margin + 115, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(data.studentName.trim(), margin + 138, y + 7);
  }

  y += 24;

  // Main Grade Result Card
  doc.setFillColor(240, 253, 250); // soft teal tint
  doc.setDrawColor(45, 140, 126);
  doc.setLineWidth(0.7);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 89, 80);
  doc.text('CURRENT GRADE SUMMARY', margin + 8, y + 7);

  // Large percent and letter
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const percentStr = `${data.percent.toFixed(1)}%`;
  doc.text(percentStr, margin + 8, y + 20);

  // Letter Grade badge
  const letterBoxX = margin + 8 + doc.getTextWidth(percentStr) + 6;
  doc.setFillColor(31, 89, 80);
  doc.roundedRect(letterBoxX, y + 10, 16, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(data.letter, letterBoxX + 8, y + 18.5, { align: 'center' });

  // Status message
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const statusText =
    data.percent >= 90
      ? 'Status: Excellent Academic Standing (Grade A)'
      : data.percent >= 80
      ? 'Status: Commendable Performance (Grade B)'
      : data.percent >= 70
      ? 'Status: Satisfactory Academic Standing (Grade C)'
      : data.percent >= 60
      ? 'Status: Passing Requirement Met (Grade D)'
      : 'Status: Action Required (Below Passing Threshold)';
  doc.text(statusText, margin + 110, y + 17, { align: 'right' });

  y += 33;

  // Assessments Table Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Assessment Breakdown', margin, y);

  y += 5;

  // Table Columns Setup
  const cols = [
    { label: '#', x: margin + 3, w: 10, align: 'left' as const },
    { label: 'Assessment Name', x: margin + 14, w: 60, align: 'left' as const },
    { label: 'Earned', x: margin + 85, w: 22, align: 'right' as const },
    { label: 'Possible', x: margin + 110, w: 22, align: 'right' as const },
    { label: 'Score %', x: margin + 135, w: 20, align: 'right' as const },
    ...(data.mode === 'weighted'
      ? [{ label: 'Weight', x: margin + 160, w: 14, align: 'right' as const }]
      : []),
  ];

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);

  cols.forEach((col) => {
    doc.text(col.label, col.x, y + 4.8, { align: col.align });
  });

  y += 7;

  // Table Data Rows
  const validItems = data.assessments.filter((a) => !a.invalid);
  validItems.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, y, contentWidth, 7, 'F');

    // Bottom row border
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 7, margin + contentWidth, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    const scorePct = item.maxNum > 0 ? (item.scoreNum / item.maxNum) * 100 : 0;

    doc.text(String(idx + 1), cols[0].x, y + 4.8, { align: cols[0].align });
    doc.setFont('helvetica', 'bold');
    doc.text(item.name || `Assessment ${idx + 1}`, cols[1].x, y + 4.8, {
      align: cols[1].align,
    });
    doc.setFont('helvetica', 'normal');
    doc.text(String(item.scoreNum), cols[2].x, y + 4.8, { align: cols[2].align });
    doc.text(String(item.maxNum), cols[3].x, y + 4.8, { align: cols[3].align });
    doc.text(`${scorePct.toFixed(1)}%`, cols[4].x, y + 4.8, { align: cols[4].align });

    if (data.mode === 'weighted' && cols[5]) {
      doc.text(`${item.weightNum}`, cols[5].x, y + 4.8, { align: cols[5].align });
    }

    y += 7;
  });

  // Table Totals / Summary Row
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  const totalEarned = validItems.reduce((acc, c) => acc + c.scoreNum, 0);
  const totalPossible = validItems.reduce((acc, c) => acc + c.maxNum, 0);
  const totalWeight = validItems.reduce((acc, c) => acc + c.weightNum, 0);

  doc.text('TOTAL / OVERALL', cols[1].x, y + 5.5);
  doc.text(String(totalEarned), cols[2].x, y + 5.5, { align: cols[2].align });
  doc.text(String(totalPossible), cols[3].x, y + 5.5, { align: cols[3].align });
  doc.text(`${data.percent.toFixed(1)}%`, cols[4].x, y + 5.5, { align: cols[4].align });

  if (data.mode === 'weighted' && cols[5]) {
    doc.text(String(totalWeight), cols[5].x, y + 5.5, { align: cols[5].align });
  }

  y += 14;

  // What-If Scenario (if tested)
  if (data.whatIf) {
    doc.setFillColor(254, 243, 199); // amber soft
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9);
    doc.text('WHAT-IF PROJECTION SIMULATION:', margin + 6, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 53, 15);
    const whatIfWeightPart = data.mode === 'weighted' && data.whatIf.weight
      ? ` (Weight: ${data.whatIf.weight})`
      : '';
    doc.text(
      `Hypothetical assessment with ${data.whatIf.earned}/${data.whatIf.possible} points${whatIfWeightPart} would bring the cumulative grade to ${data.whatIf.projectedPercent.toFixed(1)}% (${data.whatIf.projectedLetter}).`,
      margin + 6,
      y + 10.5
    );

    y += 19;
  }

  // Grading Scale Reference Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Institutional Scale Reference', margin, y);

  y += 4;
  const currentScale = GRADING_SCALES[data.scale];
  const scaleItemW = contentWidth / currentScale.length;

  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 11, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.rect(margin, y, contentWidth, 11, 'D');

  currentScale.forEach((s, idx) => {
    const boxX = margin + idx * scaleItemW;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(s.letter, boxX + scaleItemW / 2, y + 4.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${s.min}%+`, boxX + scaleItemW / 2, y + 8.5, { align: 'center' });
  });

  y += 20;

  // Footer Note & Verification Notice
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This grade report was generated locally by Easy Grade Calculator (easy-grade-calculator--mansoorchaudary.replit.app).',
    margin,
    y
  );
  doc.text(
    'Please verify any specific syllabus weights, dropped grades, or curve policies with your institution.',
    margin,
    y + 4
  );

  // File download
  const safeCourse = (data.courseName || 'grade-report')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  doc.save(`${safeCourse}_grade_report.pdf`);
}

export function exportGpaReportPdf(data: {
  studentName?: string;
  semesterName?: string;
  gpa: number;
  totalCredits: number;
  courses: CourseItem[];
}): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Banner
  doc.setFillColor(124, 69, 211); // Purple theme
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GPA & COURSEWORK TRANSCRIPT REPORT', margin + 8, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(243, 232, 255);
  const now = new Date();
  doc.text(
    `Easy Grade Calculator · 4.0 Scale System · Generated ${now.toLocaleDateString()}`,
    margin + 8,
    y + 18
  );

  y += 32;

  // Summary Card
  doc.setFillColor(250, 245, 255);
  doc.setDrawColor(192, 132, 252);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(124, 69, 211);
  doc.text('CUMULATIVE / SEMESTER GPA', margin + 8, y + 7);

  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.gpa.toFixed(2)} / 4.0`, margin + 8, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total Credits Earned: ${data.totalCredits.toFixed(1)}   |   Courses: ${data.courses.length}`, margin + 80, y + 16);

  y += 32;

  // Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Courses & Quality Points', margin, y);

  y += 5;

  const cols = [
    { label: '#', x: margin + 3, align: 'left' as const },
    { label: 'Course Name', x: margin + 14, align: 'left' as const },
    { label: 'Credits', x: margin + 110, align: 'right' as const },
    { label: 'Letter Grade', x: margin + 140, align: 'center' as const },
    { label: 'Quality Points', x: margin + 170, align: 'right' as const },
  ];

  doc.setFillColor(243, 232, 255);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(88, 28, 135);

  cols.forEach((c) => doc.text(c.label, c.x, y + 4.8, { align: c.align }));

  y += 7;

  data.courses.forEach((c, idx) => {
    const credits = parseFloat(c.credits) || 0;
    const qp = (GRADE_POINT_MAP[c.grade] ?? 0) * credits;

    doc.setFillColor(idx % 2 === 0 ? '#ffffff' : '#f9f5ff');
    doc.rect(margin, y, contentWidth, 7, 'F');

    doc.setDrawColor(243, 232, 255);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 7, margin + contentWidth, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    doc.text(String(idx + 1), cols[0].x, y + 4.8, { align: cols[0].align });
    doc.setFont('helvetica', 'bold');
    doc.text(c.name || `Course ${idx + 1}`, cols[1].x, y + 4.8, { align: cols[1].align });
    doc.setFont('helvetica', 'normal');
    doc.text(credits.toFixed(1), cols[2].x, y + 4.8, { align: cols[2].align });
    doc.text(c.grade, cols[3].x, y + 4.8, { align: cols[3].align });
    doc.text(qp.toFixed(1), cols[4].x, y + 4.8, { align: cols[4].align });

    y += 7;
  });

  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Calculated using standard 4.0 collegiate scale (A=4.0, B=3.0, C=2.0, D=1.0, F=0.0).', margin, y);

  doc.save('gpa_calculation_report.pdf');
}

export function exportLoanReportPdf(data: {
  title: string;
  principal: number;
  rate: number;
  years: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  extraMonthly?: number;
  downPayment?: number;
  homePrice?: number;
}): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Banner
  doc.setFillColor(37, 131, 84); // Green loan theme
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${data.title.toUpperCase()} REPORT`, margin + 8, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(220, 252, 231);
  const now = new Date();
  doc.text(
    `Easy Grade Calculator · Financial Planning Series · Generated ${now.toLocaleDateString()}`,
    margin + 8,
    y + 18
  );

  y += 32;

  // Monthly Payment Card
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(74, 222, 128);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52);
  doc.text('ESTIMATED MONTHLY PAYMENT', margin + 8, y + 7);

  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  const formattedMonthly = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(data.monthlyPayment);
  doc.text(formattedMonthly, margin + 8, y + 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Fixed Rate Term: ${data.years} years (${data.years * 12} months)`, margin + 80, y + 17);

  y += 34;

  // Details Summary Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Payment & Financing Breakdown', margin, y);

  y += 6;

  const rows: [string, string][] = [
    ...(data.homePrice ? [['Property / Purchase Price', `$${data.homePrice.toLocaleString()}`] as [string, string]] : []),
    ...(data.downPayment ? [['Down Payment', `$${data.downPayment.toLocaleString()}`] as [string, string]] : []),
    ['Total Principal Borrowed', `$${data.principal.toLocaleString()}`],
    ['Annual Interest Rate', `${data.rate.toFixed(2)}%`],
    ['Loan Term Length', `${data.years} years`],
    ...(data.extraMonthly ? [['Estimated Taxes & Insurance / Month', `$${data.extraMonthly.toFixed(2)}`] as [string, string]] : []),
    ['Total Lifetime Interest', `$${data.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Total Lifetime Payments', `$${data.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
  ];

  rows.forEach(([label, value], idx) => {
    doc.setFillColor(idx % 2 === 0 ? '#ffffff' : '#f8fafc');
    doc.rect(margin, y, contentWidth, 8, 'F');

    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 8, margin + contentWidth, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(label, margin + 5, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(value, margin + contentWidth - 5, y + 5.5, { align: 'right' });

    y += 8;
  });

  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Calculated for informational and planning purposes only. Consult lender for exact APR and escrow conditions.', margin, y);

  doc.save(`${data.title.toLowerCase().replace(/\s+/g, '_')}_calculation_report.pdf`);
}
