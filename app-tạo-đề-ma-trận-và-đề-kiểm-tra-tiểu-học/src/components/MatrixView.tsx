import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  PieChart,
} from 'lucide-react';
import { ExamData } from '../types/exam';
import { calculateMatrix, formatPoints } from '../utils/examEngine';

interface MatrixViewProps {
  exam: ExamData;
}

export const MatrixView: React.FC<MatrixViewProps> = ({ exam }) => {
  const matrix = calculateMatrix(exam.questions);

  // Standard target comparisons
  let targetM1 = 50;
  let targetM2 = 30;
  let targetM3 = 20;
  let targetTN = 60;
  let targetTL = 40;

  if (exam.subject === 'Tiếng Việt') {
    targetM1 = 57; // ~4đ/7đ
    targetM2 = 29; // ~2đ/7đ
    targetM3 = 14; // ~1đ/7đ
    targetTN = 57; // 4đ TN/7đ
    targetTL = 43; // 3đ TL/7đ
  }

  // Strand targets for Grade 4 Math
  let strandNote = '';
  if (exam.subject === 'Toán' && exam.grade === 4) {
    if (exam.period === 'GKI') strandNote = 'Chuẩn Giữa kì I (GKI): Số và phép tính 70% · Hình học và đo lường 30%';
    else if (exam.period === 'CKI') strandNote = 'Chuẩn Cuối kì I (CKI): Số và phép tính 50% · Hình học và đo lường 50%';
    else if (exam.period === 'GKII') strandNote = 'Chuẩn Giữa kì II (GKII): Số và phép tính 70% · Hình học và đo lường 30%';
    else if (exam.period === 'CN') strandNote = 'Chuẩn Cuối năm (CN): Số và PT 70% · Hình học và ĐL 20% · Thống kê & XS 10%';
  }

  return (
    <div className="max-w-6xl mx-auto bg-white border border-slate-200 shadow-sm rounded-xl p-6 sm:p-10 my-6 font-exam print:m-0 print:p-0 print:border-none print:shadow-none">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase text-slate-900">
          KHUNG MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ
        </h2>
        <p className="text-sm font-semibold uppercase text-slate-800">
          MÔN: {exam.subject.toUpperCase()} - LỚP {exam.grade} ({exam.bookSeries})
        </p>
        <p className="text-xs italic text-slate-600">
          Kỳ kiểm tra: {exam.period} · Năm học: {exam.academicYear} · Định hướng Chương trình GDPT 2018
        </p>
        {strandNote && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-md text-xs font-sans font-medium no-print">
            <Info className="w-3.5 h-3.5 text-amber-700" />
            <span>{strandNote}</span>
          </div>
        )}
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="w-full text-center border-collapse text-xs text-slate-900">
          <thead>
            {/* Header Level 1 */}
            <tr className="bg-slate-100 border-b border-slate-800 font-bold">
              <th rowSpan={2} className="border-r border-slate-800 p-2 w-10">
                STT
              </th>
              <th rowSpan={2} className="border-r border-slate-800 p-2 text-left w-56">
                Mạch kiến thức, kĩ năng / Đơn vị bài học
              </th>
              <th colSpan={2} className="border-r border-slate-800 p-2 bg-blue-50/80">
                Mức 1: Biết
              </th>
              <th colSpan={2} className="border-r border-slate-800 p-2 bg-indigo-50/80">
                Mức 2: Hiểu
              </th>
              <th rowSpan={2} className="border-r border-slate-800 p-2 bg-purple-50/80 w-24">
                Mức 3: Vận dụng
                <div className="text-[10px] font-normal text-purple-700">(Chỉ Tự luận)</div>
              </th>
              <th colSpan={3} className="p-2 bg-slate-200/80">
                Tổng cộng
              </th>
            </tr>
            {/* Header Level 2 */}
            <tr className="bg-slate-50 border-b border-slate-800 font-semibold text-[11px]">
              <th className="border-r border-slate-800 p-1.5 bg-blue-50/50 w-20">TN</th>
              <th className="border-r border-slate-800 p-1.5 bg-blue-50/50 w-20">TL</th>
              <th className="border-r border-slate-800 p-1.5 bg-indigo-50/50 w-20">TN</th>
              <th className="border-r border-slate-800 p-1.5 bg-indigo-50/50 w-20">TL</th>
              <th className="border-r border-slate-800 p-1.5 w-16">Số câu</th>
              <th className="border-r border-slate-800 p-1.5 w-16">Số điểm</th>
              <th className="p-1.5 w-16">Tỉ lệ</th>
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-300 hover:bg-slate-50/50 transition-colors">
                <td className="border-r border-slate-800 p-2 font-medium">{idx + 1}</td>
                <td className="border-r border-slate-800 p-2 text-left">
                  <div className="font-bold text-slate-900">{row.strand}</div>
                  <div className="text-[11px] text-slate-600">{row.topic}</div>
                </td>

                {/* Mức 1 - TN */}
                <td className="border-r border-slate-800 p-2 bg-blue-50/20">
                  {row.m1_tn.count > 0 ? (
                    <div>
                      <span className="font-bold">{row.m1_tn.count}</span> câu
                      <div className="text-[10px] text-slate-600">({formatPoints(row.m1_tn.points)}đ)</div>
                      <div className="text-[10px] text-blue-700 italic">
                        C.{row.m1_tn.questionNumbers.join(', ')}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>

                {/* Mức 1 - TL */}
                <td className="border-r border-slate-800 p-2 bg-blue-50/20">
                  {row.m1_tl.count > 0 ? (
                    <div>
                      <span className="font-bold">{row.m1_tl.count}</span> câu
                      <div className="text-[10px] text-slate-600">({formatPoints(row.m1_tl.points)}đ)</div>
                      <div className="text-[10px] text-blue-700 italic">
                        C.{row.m1_tl.questionNumbers.join(', ')}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>

                {/* Mức 2 - TN */}
                <td className="border-r border-slate-800 p-2 bg-indigo-50/20">
                  {row.m2_tn.count > 0 ? (
                    <div>
                      <span className="font-bold">{row.m2_tn.count}</span> câu
                      <div className="text-[10px] text-slate-600">({formatPoints(row.m2_tn.points)}đ)</div>
                      <div className="text-[10px] text-indigo-700 italic">
                        C.{row.m2_tn.questionNumbers.join(', ')}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>

                {/* Mức 2 - TL */}
                <td className="border-r border-slate-800 p-2 bg-indigo-50/20">
                  {row.m2_tl.count > 0 ? (
                    <div>
                      <span className="font-bold">{row.m2_tl.count}</span> câu
                      <div className="text-[10px] text-slate-600">({formatPoints(row.m2_tl.points)}đ)</div>
                      <div className="text-[10px] text-indigo-700 italic">
                        C.{row.m2_tl.questionNumbers.join(', ')}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>

                {/* Mức 3 - TL */}
                <td className="border-r border-slate-800 p-2 bg-purple-50/20">
                  {row.m3_tl.count > 0 ? (
                    <div>
                      <span className="font-bold">{row.m3_tl.count}</span> câu
                      <div className="text-[10px] text-slate-600">({formatPoints(row.m3_tl.points)}đ)</div>
                      <div className="text-[10px] text-purple-700 italic font-semibold">
                        C.{row.m3_tl.questionNumbers.join(', ')}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>

                {/* Total per row */}
                <td className="border-r border-slate-800 p-2 font-bold">{row.total_count}</td>
                <td className="border-r border-slate-800 p-2 font-bold text-slate-900">
                  {formatPoints(row.total_points)}đ
                </td>
                <td className="p-2 font-semibold text-emerald-800">{row.percentage}%</td>
              </tr>
            ))}

            {/* GRAND TOTAL SUMMARY ROW */}
            <tr className="bg-slate-100 border-t-2 border-slate-800 font-bold text-slate-900">
              <td colSpan={2} className="border-r border-slate-800 p-2.5 text-center uppercase tracking-wide">
                TỔNG CỘNG
              </td>
              <td colSpan={2} className="border-r border-slate-800 p-2.5 bg-blue-100/70">
                <div>{formatPoints(matrix.totalM1Points)} điểm</div>
                <div className="text-[11px] font-semibold text-blue-900">({matrix.m1Percentage}%)</div>
              </td>
              <td colSpan={2} className="border-r border-slate-800 p-2.5 bg-indigo-100/70">
                <div>{formatPoints(matrix.totalM2Points)} điểm</div>
                <div className="text-[11px] font-semibold text-indigo-900">({matrix.m2Percentage}%)</div>
              </td>
              <td className="border-r border-slate-800 p-2.5 bg-purple-100/70">
                <div>{formatPoints(matrix.totalM3Points)} điểm</div>
                <div className="text-[11px] font-semibold text-purple-900">({matrix.m3Percentage}%)</div>
              </td>
              <td className="border-r border-slate-800 p-2.5">{matrix.grandTotalQuestions}</td>
              <td className="border-r border-slate-800 p-2.5 text-emerald-900">
                {formatPoints(matrix.grandTotalPoints)} điểm
              </td>
              <td className="p-2.5 text-emerald-900">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* MATRIX AUDIT & PEDAGOGICAL BREAKDOWN CARDS */}
      <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 font-sans no-print">
        {/* Cognitive Level Breakdown */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Tỉ lệ Mức độ nhận thức (Chuẩn {targetM1}% - {targetM2}% - {targetM3}%)
              </h3>
            </div>
            {Math.abs(matrix.m1Percentage - targetM1) <= 6 &&
            Math.abs(matrix.m2Percentage - targetM2) <= 6 &&
            Math.abs(matrix.m3Percentage - targetM3) <= 6 ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Đạt chuẩn
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <AlertTriangle className="w-3 h-3" /> Chênh lệch nhẹ
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Mức 1 (Biết)</span>
                <span>
                  <strong>{matrix.totalM1Points}đ</strong> ({matrix.m1Percentage}% / chuẩn {targetM1}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, matrix.m1Percentage)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Mức 2 (Hiểu)</span>
                <span>
                  <strong>{matrix.totalM2Points}đ</strong> ({matrix.m2Percentage}% / chuẩn {targetM2}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, matrix.m2Percentage)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Mức 3 (Vận dụng)</span>
                <span>
                  <strong>{matrix.totalM3Points}đ</strong> ({matrix.m3Percentage}% / chuẩn {targetM3}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, matrix.m3Percentage)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Format Breakdown (TN vs TL) */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Tỉ lệ Hình thức Đề thi (TN {targetTN}% - TL {targetTL}%)
              </h3>
            </div>
            {Math.abs(matrix.tnPercentage - targetTN) <= 6 ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Đạt chuẩn 60/40
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <AlertTriangle className="w-3 h-3" /> Cần cân đối
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Trắc nghiệm khách quan</span>
                <span>
                  <strong>{matrix.totalTNPoints}đ</strong> ({matrix.tnPercentage}% / chuẩn {targetTN}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, matrix.tnPercentage)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Tự luận</span>
                <span>
                  <strong>{matrix.totalTLPoints}đ</strong> ({matrix.tlPercentage}% / chuẩn {targetTL}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, matrix.tlPercentage)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 italic pt-1">
            * Quy tắc tuyệt đối: Không tạo câu trắc nghiệm ở Mức 3 (Vận dụng).
          </div>
        </div>
      </div>
    </div>
  );
};
