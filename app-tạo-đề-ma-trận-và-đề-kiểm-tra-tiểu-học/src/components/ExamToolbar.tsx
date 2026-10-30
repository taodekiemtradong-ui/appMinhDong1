import React from 'react';
import {
  Plus,
  ArrowDownUp,
  FileEdit,
  Sparkles,
  BookOpenCheck,
  HelpCircle,
} from 'lucide-react';
import { ExamData, PeriodType } from '../types/exam';
import { calculateMatrix } from '../utils/examEngine';

interface ExamToolbarProps {
  exam: ExamData;
  activeTab: 'paper' | 'matrix' | 'specs' | 'rubric' | 'audit';
  onChangeTab: (tab: 'paper' | 'matrix' | 'specs' | 'rubric' | 'audit') => void;
  onUpdateExamField: (field: keyof ExamData, value: any) => void;
  onSelectSampleExam: (key: string) => void;
  onSortQuestions: () => void;
  onOpenAddQuestion: () => void;
  onOpenPassageModal: () => void;
}

export const ExamToolbar: React.FC<ExamToolbarProps> = ({
  exam,
  activeTab,
  onChangeTab,
  onUpdateExamField,
  onSelectSampleExam,
  onSortQuestions,
  onOpenAddQuestion,
  onOpenPassageModal,
}) => {
  const matrix = calculateMatrix(exam.questions);

  return (
    <div className="bg-white border-b border-slate-200 no-print">
      {/* Subject & Preset Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Preset Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Đề mẫu chuẩn:
            </span>
            <button
              onClick={() => onSelectSampleExam('math-g4-gki')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                exam.id === 'math-g4-gki'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Toán 4 (GKI - KNTT)
            </button>
            <button
              onClick={() => onSelectSampleExam('vietnamese-g4-gki')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                exam.id === 'vietnamese-g4-gki'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tiếng Việt 4 (11 câu đọc hiểu + Bài đọc ngoài SGK)
            </button>
            <button
              onClick={() => onSelectSampleExam('history-geo-g4-gki')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                exam.id === 'history-geo-g4-gki'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Lịch sử & Địa lý 4 (GKI - KNTT)
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400">Tổng câu:</span>{' '}
              <strong className="text-slate-900">{exam.questions.length}</strong>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              <span className="text-slate-400">Tổng điểm:</span>{' '}
              <strong className="text-slate-900">{matrix.grandTotalPoints}đ</strong>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              <span className="text-slate-400">TN/TL:</span>{' '}
              <strong className="text-emerald-700">{matrix.tnPercentage}% / {matrix.tlPercentage}%</strong>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              <span className="text-slate-400">M1-M2-M3:</span>{' '}
              <strong className="text-indigo-700">
                {matrix.m1Percentage}% - {matrix.m2Percentage}% - {matrix.m3Percentage}%
              </strong>
            </div>
          </div>
        </div>

        {/* Filters & Configuration Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-slate-500 mb-0.5">Môn học:</label>
            <select
              value={exam.subject}
              onChange={(e) => onUpdateExamField('subject', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="Toán">Toán</option>
              <option value="Tiếng Việt">Tiếng Việt</option>
              <option value="Lịch sử và Địa lý">Lịch sử và Địa lý</option>
              <option value="Khoa học">Khoa học</option>
              <option value="Tin học và Công nghệ">Tin học và Công nghệ</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-0.5">Khối lớp:</label>
            <select
              value={exam.grade}
              onChange={(e) => onUpdateExamField('grade', Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value={1}>Lớp 1</option>
              <option value={2}>Lớp 2</option>
              <option value={3}>Lớp 3</option>
              <option value={4}>Lớp 4 (Trọng tâm)</option>
              <option value={5}>Lớp 5</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-0.5">Bộ sách:</label>
            <select
              value={exam.bookSeries}
              onChange={(e) => onUpdateExamField('bookSeries', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="Kết nối tri thức với cuộc sống">Kết nối tri thức</option>
              <option value="Cánh diều">Cánh diều</option>
              <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-0.5">Kỳ kiểm tra:</label>
            <select
              value={exam.period}
              onChange={(e) => onUpdateExamField('period', e.target.value as PeriodType)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="GKI">Giữa học kì I (GKI)</option>
              <option value="CKI">Cuối học kì I (CKI)</option>
              <option value="GKII">Giữa học kì II (GKII)</option>
              <option value="CN">Cuối năm (CN)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-0.5">Thời gian làm bài:</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={exam.duration}
                onChange={(e) => onUpdateExamField('duration', Number(e.target.value))}
                className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 text-center"
              />
              <span className="text-slate-500">phút</span>
            </div>
          </div>

          {/* Action buttons inside toolbar */}
          <div className="flex items-end gap-1.5">
            <button
              onClick={onSortQuestions}
              className="flex-1 flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-1 px-2 rounded shadow-xs transition-colors"
              title="Tự động sắp xếp câu theo chuẩn: TN (M1->M2) đến TL (M1->M2->M3) và đánh lại số câu từ 1..N"
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              <span>Sắp xếp chuẩn</span>
            </button>
            <button
              onClick={onOpenAddQuestion}
              className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1 px-2 rounded shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm câu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (5 Tabs) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => onChangeTab('paper')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'paper'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span>1. Đề kiểm tra (Bản học sinh)</span>
          </button>

          <button
            onClick={() => onChangeTab('matrix')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpenCheck className="w-4 h-4" />
            <span>2. Khung ma trận 2 chiều</span>
          </button>

          <button
            onClick={() => onChangeTab('specs')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3. Bản đặc tả chi tiết</span>
          </button>

          <button
            onClick={() => onChangeTab('rubric')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'rubric'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>4. Đáp án & Hướng dẫn chấm</span>
          </button>

          <button
            onClick={() => onChangeTab('audit')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>5. Thẩm định chuẩn GDPT 2018</span>
          </button>
        </div>
      </div>
    </div>
  );
};
