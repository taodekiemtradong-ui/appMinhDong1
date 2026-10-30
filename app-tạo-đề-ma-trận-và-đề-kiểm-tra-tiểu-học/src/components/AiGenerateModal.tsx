import React, { useState } from 'react';
import { X, Sparkles, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExamData, PeriodType } from '../types/exam';
import { sortExamQuestions } from '../utils/examEngine';

interface AiGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamGenerated: (exam: ExamData) => void;
  currentSubject: string;
  currentGrade: number;
  currentBookSeries: string;
  currentPeriod: PeriodType;
}

export const AiGenerateModal: React.FC<AiGenerateModalProps> = ({
  isOpen,
  onClose,
  onExamGenerated,
  currentSubject,
  currentGrade,
  currentBookSeries,
  currentPeriod,
}) => {
  const [subject, setSubject] = useState(currentSubject || 'Toán');
  const [grade, setGrade] = useState(currentGrade || 4);
  const [bookSeries, setBookSeries] = useState(currentBookSeries || 'Kết nối tri thức với cuộc sống');
  const [period, setPeriod] = useState<PeriodType>(currentPeriod || 'GKI');
  const [readingGenre, setReadingGenre] = useState('story');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          bookSeries,
          period,
          readingGenre: subject === 'Tiếng Việt' ? readingGenre : undefined,
          customPrompt,
        }),
      });

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Không thể tạo đề bằng AI.');
      }

      const generated = result.data;
      // Guarantee ID and normalized structure
      const newExam: ExamData = {
        id: `ai-exam-${Date.now()}`,
        title: generated.title || `ĐỀ KIỂM TRA ĐỊNH KÌ ${period}`,
        school: generated.school || 'TRƯỜNG TIỂU HỌC KIM ĐỒNG',
        district: generated.district || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO',
        province: generated.province || 'THÀNH PHỐ HÀ NỘI',
        subject: subject as any,
        grade,
        bookSeries: bookSeries as any,
        period,
        academicYear: '2026 - 2027',
        duration: generated.duration || (subject === 'Toán' ? 40 : 35),
        readingPassage: generated.readingPassage,
        writingSection: generated.writingSection,
        questions: sortExamQuestions(generated.questions || []),
        notes: generated.notes,
      };

      onExamGenerated(newExam);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi khởi tạo đề kiểm tra bằng AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-indigo-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                AI Chuyên Gia Khảo Thí Tiểu Học
              </h3>
              <p className="text-xs text-indigo-700">
                Tự động thiết kế trọn gói Ma trận, Bản đặc tả, Đề thi và Hướng dẫn chấm chuẩn GDPT 2018
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleGenerate} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
            Hệ thống sẽ áp dụng chính xác mọi quy tắc:
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600 font-medium">
              <li>Xếp câu liên tục từ 1..N, không ghi tiêu đề Trắc nghiệm / Tự luận</li>
              <li>Thứ tự nghiêm ngặt: TN M1 -&gt; TN M2 -&gt; TL M1 -&gt; TL M2 -&gt; TL M3</li>
              <li>Tuyệt đối KHÔNG có câu trắc nghiệm Mức 3 (Vận dụng)</li>
              <li>Tiếng Việt: Sinh bài đọc ngoài SGK chuẩn số từ + Đủ 11 câu hỏi đọc hiểu (7đ)</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Môn học:</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value="Toán">Toán (Bộ Kết nối tri thức)</option>
                <option value="Tiếng Việt">Tiếng Việt (11 câu đọc hiểu + Bài đọc ngoài SGK)</option>
                <option value="Lịch sử và Địa lý">Lịch sử và Địa lý</option>
                <option value="Khoa học">Khoa học</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Khối lớp:</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value={4}>Lớp 4 (Trọng tâm GDPT 2018)</option>
                <option value={1}>Lớp 1</option>
                <option value={2}>Lớp 2</option>
                <option value={3}>Lớp 3</option>
                <option value={5}>Lớp 5</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bộ sách giáo khoa:</label>
              <select
                value={bookSeries}
                onChange={(e) => setBookSeries(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value="Kết nối tri thức với cuộc sống">Kết nối tri thức với cuộc sống</option>
                <option value="Cánh diều">Cánh diều</option>
                <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kỳ kiểm tra:</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value="GKI">Giữa học kì I (GKI)</option>
                <option value="CKI">Cuối học kì I (CKI)</option>
                <option value="GKII">Giữa học kì II (GKII)</option>
                <option value="CN">Cuối năm (CN)</option>
              </select>
            </div>
          </div>

          {subject === 'Tiếng Việt' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Thể loại bài đọc ngoài SGK (quy chuẩn độ dài):
              </label>
              <select
                value={readingGenre}
                onChange={(e) => setReadingGenre(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value="story">Truyện, kịch bản (Khoảng 280 – 330 chữ)</option>
                <option value="description">Bài miêu tả (Khoảng 200 – 250 chữ)</option>
                <option value="poem">Thơ thiếu nhi (Khoảng 100 – 120 chữ)</option>
                <option value="info">Văn bản thông tin (Khoảng 150 – 180 chữ)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Yêu cầu bổ sung của giáo viên (tùy chọn):
            </label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ví dụ: Tập trung vào bài Tìm hai số khi biết tổng và hiệu; hoặc: Chủ đề bài đọc về lòng biết ơn cha mẹ thầy cô; hoặc: Tạo đề B với các số liệu song sinh..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Đang biên soạn trọn bộ hồ sơ đề...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo trọn bộ Ma trận &amp; Đề thi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
