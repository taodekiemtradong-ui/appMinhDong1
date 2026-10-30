import React from 'react';
import {
  Pencil,
  Trash2,
  Copy,
  BookOpen,
  Sparkles,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { ExamData, QuestionItem } from '../types/exam';
import { formatPoints, countWords } from '../utils/examEngine';

interface ExamPaperViewProps {
  exam: ExamData;
  onEditQuestion: (q: QuestionItem) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion: (q: QuestionItem) => void;
  onOpenPassageModal: () => void;
}

export const ExamPaperView: React.FC<ExamPaperViewProps> = ({
  exam,
  onEditQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onOpenPassageModal,
}) => {
  const isVietnamese = exam.subject === 'Tiếng Việt';
  const readingPassage = exam.readingPassage;

  return (
    <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-sm rounded-xl p-8 sm:p-12 font-exam text-[15px] leading-relaxed text-slate-900 my-6 print:m-0 print:p-0 print:border-none print:shadow-none">
      {/* Official Header Table */}
      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-300">
        <div className="text-center space-y-0.5">
          <p className="text-xs uppercase font-medium text-slate-600">{exam.district}</p>
          <p className="text-sm font-bold uppercase text-slate-900">{exam.school}</p>
          <div className="w-16 h-0.5 bg-slate-400 mx-auto mt-1"></div>
        </div>
        <div className="text-center space-y-0.5">
          <p className="text-base font-bold uppercase text-slate-900">{exam.title}</p>
          <p className="text-xs font-bold uppercase text-slate-800">
            MÔN: {exam.subject.toUpperCase()} - LỚP {exam.grade} ({exam.bookSeries})
          </p>
          <p className="text-xs italic text-slate-600">
            Năm học: {exam.academicYear} · Thời gian: {exam.duration} phút
          </p>
        </div>
      </div>

      {/* Student Info Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b border-slate-200 text-sm">
        <div className="sm:col-span-2">
          <span>Họ và tên học sinh: </span>
          <span className="font-semibold text-slate-700">...........................................................................</span>
        </div>
        <div>
          <span>Lớp: </span>
          <span className="font-semibold text-slate-700">4.......</span>
        </div>
      </div>

      {/* Score and Teacher Comments Box */}
      <div className="grid grid-cols-3 border border-slate-800 rounded-md my-4 overflow-hidden text-center text-sm">
        <div className="border-r border-slate-800 p-2 bg-slate-50 flex flex-col justify-between">
          <p className="font-bold text-slate-900 uppercase">ĐIỂM SỐ</p>
          <div className="h-14"></div>
          {isVietnamese && (
            <p className="text-[11px] text-slate-500 italic">
              (Đọc TT: 3đ · Đọc hiểu: 7đ)
            </p>
          )}
        </div>
        <div className="col-span-2 p-2 text-left flex flex-col justify-between">
          <p className="font-bold text-slate-900 uppercase text-center">LỜI NHẬN XÉT CỦA GIÁO VIÊN</p>
          <div className="h-14 flex flex-col justify-around text-slate-400 text-xs">
            <p className="border-b border-dotted border-slate-300"></p>
            <p className="border-b border-dotted border-slate-300"></p>
          </div>
        </div>
      </div>

      {/* READING PASSAGE (For Vietnamese Subject) */}
      {isVietnamese && readingPassage && (
        <div className="my-6 p-5 bg-amber-50/40 rounded-lg border border-amber-200/60 print:bg-transparent print:p-0 print:border-none">
          <div className="flex items-center justify-between mb-2 no-print">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wide">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>Văn bản đọc ngoài SGK (Chương trình GDPT 2018)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-white border border-amber-300 font-medium text-amber-800">
                {countWords(readingPassage.text)} chữ (Quy định: 280-330 chữ)
              </span>
              <button
                onClick={onOpenPassageModal}
                className="flex items-center gap-1 text-xs bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 px-2 py-1 rounded shadow-xs transition-colors"
              >
                <Pencil className="w-3 h-3" />
                <span>Đổi / Sửa bài đọc</span>
              </button>
            </div>
          </div>

          <div className="text-center my-3">
            <h2 className="text-lg font-bold tracking-wide uppercase text-slate-900">
              {readingPassage.title}
            </h2>
          </div>

          <div className="space-y-2 text-justify text-slate-800 leading-relaxed font-exam text-[15px]">
            {readingPassage.text.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="indent-8">
                {paragraph.trim()}
              </p>
            ))}
          </div>

          <div className="text-right mt-2 text-xs italic text-slate-600">
            ({readingPassage.author})
          </div>

          <div className="mt-4 pt-3 border-t border-slate-300 italic text-slate-700 text-sm">
            Dựa vào nội dung bài đọc trên, em hãy khoanh tròn vào chữ cái trước câu trả lời đúng và hoàn thành các bài tập sau:
          </div>
        </div>
      )}

      {/* NOTE BANNER REMINDER: DO NOT SHOW "TRẮC NGHIỆM" OR "TỰ LUẬN" HEADERS */}
      <div className="my-3 py-1 px-3 bg-emerald-50 text-emerald-800 text-xs rounded border border-emerald-200 flex items-center justify-between no-print">
        <span className="font-medium">
          ✓ Quy chuẩn GDPT 2018: Đề thi đánh số liên tục từ Câu 1 đến hết · KHÔNG có tiêu đề &quot;Trắc nghiệm&quot; hay &quot;Tự luận&quot;.
        </span>
        <span className="text-emerald-700 text-[11px]">
          Xếp TN M1 → TN M2 → TL M1 → TL M2 → TL M3
        </span>
      </div>

      {/* QUESTIONS LIST */}
      <div className="space-y-5 my-4">
        {exam.questions.map((q) => {
          return (
            <div
              key={q.id}
              className="group relative p-2 -mx-2 rounded hover:bg-slate-50/80 transition-colors print:p-0 print:m-0"
            >
              {/* Question Action Buttons (Hidden when printing) */}
              <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-xs text-xs no-print">
                <span className="text-[10px] text-slate-500 uppercase px-1 font-semibold">
                  {q.level.toUpperCase()} · {q.type.toUpperCase()}
                </span>
                <button
                  onClick={() => onEditQuestion(q)}
                  className="p-1 hover:text-emerald-700 transition-colors"
                  title="Chỉnh sửa câu hỏi"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDuplicateQuestion(q)}
                  className="p-1 hover:text-indigo-700 transition-colors"
                  title="Nhân bản câu hỏi"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteQuestion(q.id)}
                  className="p-1 hover:text-rose-700 transition-colors"
                  title="Xóa câu hỏi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Exact format: Câu X(Y điểm): [bold] [italic non-bold] [normal text] */}
              <div className="text-slate-900 text-justify">
                <strong className="font-bold">Câu {q.order}</strong>
                <span className="italic font-normal">
                  ({formatPoints(q.points)} điểm):{' '}
                </span>
                <span className="font-normal">{q.content}</span>
              </div>

              {/* MCQ Options: Indented 1 tab (1cm / ~28px) */}
              {q.type === 'mcq' && q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mt-2 pl-7">
                  {q.options.map((opt) => (
                    <div key={opt.label} className="flex items-baseline gap-1.5">
                      <strong className="font-bold text-slate-900">{opt.label}.</strong>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-questions for True/False (Đúng Sai) or Điền khuyết */}
              {q.subQuestions && q.subQuestions.length > 0 && (
                <div className="space-y-1 mt-1.5 pl-4 text-sm">
                  {q.subQuestions.map((sq, sIdx) => (
                    <div key={sIdx} className="text-slate-800">
                      {sq}
                    </div>
                  ))}
                </div>
              )}

              {/* Matching Pairs (Nối cột) */}
              {q.matchingPairs && q.matchingPairs.length > 0 && (
                <div className="grid grid-cols-2 gap-4 my-2 pl-4 text-sm border border-slate-200 rounded p-3 bg-slate-50/50 print:bg-transparent">
                  <div>
                    <p className="font-bold text-xs uppercase text-slate-500 mb-1">Cột A</p>
                    <div className="space-y-1">
                      {q.matchingPairs.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700">{idx + 1}.</span>
                          <span>{p.left}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-xs uppercase text-slate-500 mb-1">Cột B</p>
                    <div className="space-y-1">
                      {q.matchingPairs.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700">{String.fromCharCode(65 + idx)}.</span>
                          <span>{p.right}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Essay Answering Lines */}
              {q.type === 'essay' && (
                <div className="mt-2 pl-2 space-y-4 py-2">
                  <p className="text-xs italic text-slate-500">Bài làm:</p>
                  <div className="space-y-4">
                    {Array.from({ length: q.level === 'm3' ? 5 : q.level === 'm2' ? 3 : 2 }).map(
                      (_, lineIdx) => (
                        <div
                          key={lineIdx}
                          className="border-b border-dotted border-slate-300 h-2"
                        ></div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Writing Section (If Vietnamese Language) */}
      {isVietnamese && exam.writingSection && (
        <div className="mt-8 pt-6 border-t-2 border-slate-300 page-break-before">
          <div className="text-center mb-4">
            <h3 className="text-base font-bold uppercase text-slate-900">
              {exam.writingSection.title}
            </h3>
            <p className="text-xs italic text-slate-600">Thời gian làm bài: 35 phút</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 print:bg-transparent print:p-0 print:border-none">
            <p className="font-bold text-slate-900 mb-4">{exam.writingSection.prompt}</p>
            <div className="space-y-5 pt-3">
              <p className="text-xs italic text-slate-500">Bài làm:</p>
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} className="border-b border-dotted border-slate-300 h-2"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exam Footer */}
      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs italic text-slate-500">
        --- HẾT ---
        <p className="text-[11px] not-italic text-slate-400 mt-1">
          (Cán bộ coi kiểm tra không giải thích gì thêm)
        </p>
      </div>
    </div>
  );
};
