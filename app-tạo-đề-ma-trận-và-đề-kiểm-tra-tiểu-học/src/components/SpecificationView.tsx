import React from 'react';
import { ExamData } from '../types/exam';
import { formatPoints, generateSpecifications } from '../utils/examEngine';

interface SpecificationViewProps {
  exam: ExamData;
}

export const SpecificationView: React.FC<SpecificationViewProps> = ({ exam }) => {
  const specs = generateSpecifications(exam.questions);

  return (
    <div className="max-w-6xl mx-auto bg-white border border-slate-200 shadow-sm rounded-xl p-6 sm:p-10 my-6 font-exam print:m-0 print:p-0 print:border-none print:shadow-none">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase text-slate-900">
          BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ
        </h2>
        <p className="text-sm font-semibold uppercase text-slate-800">
          MÔN: {exam.subject.toUpperCase()} - LỚP {exam.grade} ({exam.bookSeries})
        </p>
        <p className="text-xs italic text-slate-600">
          Kỳ kiểm tra: {exam.period} · Năm học: {exam.academicYear} · Quy chuẩn: 1 câu hỏi tương ứng 1 bản đặc tả chi tiết
        </p>
      </div>

      {/* Specifications Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="w-full text-center border-collapse text-xs text-slate-900">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-800 font-bold">
              <th className="border-r border-slate-800 p-2 w-10">STT</th>
              <th className="border-r border-slate-800 p-2 text-left w-44">
                Mạch kiến thức, kĩ năng
              </th>
              <th className="border-r border-slate-800 p-2 text-left w-40">
                Đơn vị kiến thức / Bài học
              </th>
              <th className="border-r border-slate-800 p-2 w-28">Mức độ đánh giá</th>
              <th className="border-r border-slate-800 p-2 text-left">
                Yêu cầu cần đạt chuẩn GDPT 2018
              </th>
              <th className="border-r border-slate-800 p-2 w-32">Dạng câu hỏi</th>
              <th className="border-r border-slate-800 p-2 w-20">Câu số trong đề</th>
              <th className="p-2 w-16">Điểm</th>
            </tr>
          </thead>
          <tbody>
            {specs.map((spec) => (
              <tr
                key={spec.stt}
                className="border-b border-slate-300 hover:bg-slate-50/60 transition-colors"
              >
                <td className="border-r border-slate-800 p-2 font-medium">{spec.stt}</td>
                <td className="border-r border-slate-800 p-2 text-left font-semibold text-slate-900">
                  {spec.strand}
                </td>
                <td className="border-r border-slate-800 p-2 text-left text-slate-700">
                  {spec.topic}
                </td>
                <td className="border-r border-slate-800 p-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                      spec.level === 'm1'
                        ? 'bg-blue-50 text-blue-800'
                        : spec.level === 'm2'
                        ? 'bg-indigo-50 text-indigo-800'
                        : 'bg-purple-50 text-purple-800'
                    }`}
                  >
                    {spec.level === 'm1'
                      ? 'Mức 1 (Biết)'
                      : spec.level === 'm2'
                      ? 'Mức 2 (Hiểu)'
                      : 'Mức 3 (Vận dụng)'}
                  </span>
                </td>
                <td className="border-r border-slate-800 p-2 text-left text-slate-800 leading-relaxed">
                  {spec.competency}
                </td>
                <td className="border-r border-slate-800 p-2 text-slate-700">
                  {spec.questionFormatLabel}
                </td>
                <td className="border-r border-slate-800 p-2 font-bold text-slate-900">
                  Câu {spec.questionNumber}
                </td>
                <td className="p-2 font-bold text-slate-900">{formatPoints(spec.points)}đ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs italic text-slate-500 text-right no-print">
        * Tổng số đặc tả: {specs.length} mục tương ứng {specs.length} câu hỏi trong đề kiểm tra.
      </div>
    </div>
  );
};
