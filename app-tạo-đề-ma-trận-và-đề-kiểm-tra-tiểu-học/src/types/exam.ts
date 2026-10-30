/**
 * Types & Constants for GDPT 2018 Primary School Exam System
 */

export type QuestionType = 'mcq' | 'true_false' | 'matching' | 'fill_blank' | 'essay';

export type CognitiveLevel = 'm1' | 'm2' | 'm3'; // m1: Biết, m2: Hiểu, m3: Vận dụng

export interface OptionItem {
  label: string; // 'A', 'B', 'C', 'D'
  text: string;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface QuestionItem {
  id: string;
  order: number; // 1, 2, 3...
  type: QuestionType;
  level: CognitiveLevel;
  strand: string; // Mạch kiến thức (e.g. "Số và phép tính", "Hình học và đo lường")
  topic: string; // Chủ đề / Bài học
  competency: string; // Yêu cầu cần đạt chuẩn GDPT 2018
  points: number; // Điểm số
  content: string; // Đề bài
  options?: OptionItem[]; // Cho trắc nghiệm nhiều lựa chọn (4 phương án A,B,C,D)
  subQuestions?: string[]; // Cho Đúng-Sai (các ý a, b, c, d) hoặc Điền khuyết
  matchingPairs?: MatchingPair[]; // Cho Nối cột
  answerKey: string; // Đáp án đúng
  gradingGuide: string; // Hướng dẫn chấm chi tiết
}

export interface ReadingPassage {
  title: string;
  author: string;
  genre: 'story' | 'description' | 'poem' | 'info';
  text: string;
  wordCount: number;
}

export interface WritingSection {
  title: string;
  prompt: string;
  points: number;
  gradingRubric: string;
}

export type PeriodType = 'GKI' | 'CKI' | 'GKII' | 'CN';

export interface ExamData {
  id: string;
  title: string;
  school: string;
  district: string;
  province: string;
  subject: 'Toán' | 'Tiếng Việt' | 'Lịch sử và Địa lý' | 'Khoa học' | 'Tin học và Công nghệ';
  grade: number; // 4
  bookSeries: 'Kết nối tri thức với cuộc sống' | 'Cánh diều' | 'Chân trời sáng tạo';
  period: PeriodType;
  academicYear: string;
  duration: number; // Thời gian làm bài (phút)
  readingPassage?: ReadingPassage; // Riêng môn Tiếng Việt
  oralReadingPoints?: number; // Đọc thành tiếng (3đ)
  readingComprehensionPoints?: number; // Đọc hiểu (7đ)
  writingSection?: WritingSection; // Viết (10đ)
  questions: QuestionItem[];
  notes?: string;
}

export interface MatrixCellData {
  count: number;
  points: number;
  questionNumbers: number[];
}

export interface MatrixRow {
  strand: string;
  topic: string;
  m1_tn: MatrixCellData;
  m1_tl: MatrixCellData;
  m2_tn: MatrixCellData;
  m2_tl: MatrixCellData;
  m3_tl: MatrixCellData;
  total_count: number;
  total_points: number;
  percentage: number;
}

export interface MatrixSummary {
  rows: MatrixRow[];
  totalM1Points: number;
  totalM2Points: number;
  totalM3Points: number;
  m1Percentage: number;
  m2Percentage: number;
  m3Percentage: number;
  totalTNPoints: number;
  totalTLPoints: number;
  tnPercentage: number;
  tlPercentage: number;
  grandTotalPoints: number;
  grandTotalQuestions: number;
}

export interface SpecificationItem {
  stt: number;
  strand: string;
  topic: string;
  level: CognitiveLevel;
  competency: string;
  questionType: QuestionType;
  questionFormatLabel: string;
  questionNumber: number;
  points: number;
}

export interface AuditReport {
  score: number; // 0 - 100
  passed: boolean;
  checks: {
    name: string;
    description: string;
    status: 'pass' | 'fail' | 'warn';
    details: string;
  }[];
  recommendations: string[];
}
