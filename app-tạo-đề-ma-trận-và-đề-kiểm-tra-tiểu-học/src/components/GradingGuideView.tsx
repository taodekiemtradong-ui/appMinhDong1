import React from 'react';
import { ExamData } from '../types/exam';
import { formatPoints } from '../utils/examEngine';

interface GradingGuideViewProps {
  exam: ExamData;
}

export const GradingGuideView: React.FC<GradingGuideViewProps> = ({ exam }) => {
  const mcqQuestions = exam.questions.filter((q) => q.type === 'mcq');
  const otherQuestions = exam.questions.filter((q) => q.type !== 'mcq');

  return (
    <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-sm rounded-xl p-8 sm:p-12 font-exam my-6 text-[15px] leading-relaxed text-slate-900 print:m-0 print:p-0 print:border-none print:shadow-none">
      {/* Title */}
      <div className="text-center pb-4 border-b border-slate-300 mb-6">
        <h2 className="text-xl font-bold uppercase text-slate-900">
          HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM CHI TIẾT
        </h2>
        <p className="text-sm font-bold uppercase text-slate-800">
          ĐỀ KIỂM TRA ĐỊNH KÌ {exam.period} · MÔN: {exam.subject.toUpperCase()} LỚP {exam.grade}
        </p>
        <p className="text-xs italic text-slate-600">
          Năm học: {exam.academicYear} · Bộ sách: {exam.bookSeries}
        </p>
      </div>

      {/* QUICK ANSWER KEY TABLE FOR MULTIPLE CHOICE */}
      {mcqQuestions.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-sm uppercase text-slate-900 mb-2">
            I. BẢNG ĐÁP ÁN TRẮC NGHIỆM NHIỀU LỰA CHỌN (0,5 ĐIỂM/CÂU)
          </h3>
          <div className="overflow-x-auto border border-slate-800 rounded">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-800 font-bold">
                  {mcqQuestions.map((q) => (
                    <th key={q.id} className="border-r border-slate-800 p-2 last:border-none">
                      Câu {q.order}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-800 font-bold text-sm text-emerald-800">
                  {mcqQuestions.map((q) => {
                    const firstChar = q.answerKey.trim().charAt(0);
                    return (
                      <td key={q.id} className="border-r border-slate-800 p-2.5 last:border-none bg-emerald-50/40">
                        {firstChar}
                      </td>
                    );
                  })}
                </tr>
                <tr className="text-slate-600 text-[11px]">
                  {mcqQuestions.map((q) => (
                    <td key={q.id} className="border-r border-slate-800 p-1.5 last:border-none">
                      {formatPoints(q.points)}đ
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAILED GRADING GUIDELINES FOR ALL QUESTIONS */}
      <div className="space-y-6">
        <h3 className="font-bold text-sm uppercase text-slate-900 mb-3">
          II. HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM CHI TIẾT TỪNG CÂU
        </h3>

        {exam.questions.map((q) => (
          <div
            key={q.id}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 print:bg-transparent print:p-0 print:border-none space-y-1.5"
          >
            <div className="flex items-baseline justify-between gap-2">
              <div className="font-bold text-slate-900">
                Câu {q.order} ({formatPoints(q.points)} điểm):
              </div>
              <div className="text-xs text-slate-500 font-sans">
                {q.type === 'mcq'
                  ? 'TN Nhiều lựa chọn'
                  : q.type === 'true_false'
                  ? 'TN Đúng - Sai'
                  : q.type === 'matching'
                  ? 'TN Nối cột'
                  : q.type === 'fill_blank'
                  ? 'TN Điền khuyết'
                  : 'Tự luận'}{' '}
                · {q.level === 'm1' ? 'Mức 1' : q.level === 'm2' ? 'Mức 2' : 'Mức 3'}
              </div>
            </div>

            <div className="text-sm font-semibold text-emerald-900">
              Đáp án: <span className="font-medium text-slate-800">{q.answerKey}</span>
            </div>

            <div className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200/80 print:p-0 print:border-none">
              <span className="font-semibold text-slate-900">Biểu điểm &amp; Hướng dẫn chấm:</span>
              <div className="mt-1 whitespace-pre-line leading-relaxed text-slate-700">
                {q.gradingGuide}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* WRITING RUBRIC IF VIETNAMESE */}
      {exam.subject === 'Tiếng Việt' && exam.writingSection && (
        <div className="mt-8 pt-6 border-t-2 border-slate-300">
          <h3 className="font-bold text-sm uppercase text-slate-900 mb-2">
            III. HƯỚNG DẪN CHẤM PHẦN VIẾT (10,0 ĐIỂM)
          </h3>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 space-y-2 leading-relaxed">
            <p className="font-bold">{exam.writingSection.prompt}</p>
            <div className="whitespace-pre-line bg-white p-3 rounded border border-slate-200 text-slate-700">
              {exam.writingSection.gradingRubric}
            </div>
            <p className="italic text-slate-500 text-[11px]">
              * Lưu ý: Tùy theo mức độ hoàn thành bài viết của học sinh, giáo viên có thể linh hoạt cho các mức điểm lẻ đến 0,25 điểm.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
