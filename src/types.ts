export type ToolKey =
  | 'quick'
  | 'gpa'
  | 'tip'
  | 'percentage'
  | 'loan'
  | 'mortgage'
  | 'password';

export type CalculationMode = 'points' | 'weighted';

export type GradingScaleType = 'standard' | 'plus';

export interface AssessmentItem {
  id: number;
  name: string;
  score: string;
  max: string;
  weight: string;
}

export interface ValidatedAssessment extends AssessmentItem {
  scoreNum: number;
  maxNum: number;
  weightNum: number;
  invalid: boolean;
}

export interface GradeHistoryItem {
  id: number;
  percent: number;
  letter: string;
  mode: CalculationMode;
  count: number;
  createdAt: string;
  targetGrade?: number;
}

export interface CourseItem {
  id: number;
  name: string;
  credits: string;
  grade: string;
}

export interface ScaleGrade {
  letter: string;
  min: number;
  color: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface UnifiedHistoryItem {
  id: string;
  type: ToolKey;
  title: string;
  value: string;
  subtitle: string;
  details?: Record<string, any>;
  timestamp: number;
}

