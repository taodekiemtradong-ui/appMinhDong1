import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { CognitiveLevel, OptionItem, QuestionItem, QuestionType } from '../types/exam';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (q: QuestionItem) => void;
  initialQuestion?: QuestionItem | null;
  subject: string;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuestion,
  subject,
}) => {
  const [type, setType] = useState<QuestionType>('mcq');
  const [level, setLevel] = useState<CognitiveLevel>('m1');
  const [strand, setStrand] = useState('Số và phép tính');
  const [topic, setTopic] = useState('');
  const [competency, setCompetency] = useState('');
  const [points, setPoints] = useState(0.5);
  const [content, setContent] = useState('');
  const [options, setOptions] = useState<OptionItem[]>([
    { label: 'A', text: '' },
    { label: 'B', text: '' },
    { label: 'C', text: '' },
    { label: 'D', text: '' },
  ]);
  const [subQuestions, setSubQuestions] = useState<string[]>([
    'a) ................................................................',
    'b) ................................................................',
    'c) ................................................................',
    'd) ................................................................',
  ]);
  const [matchingPairs, setMatchingPairs] = useState<{ left: string; right: string }[]>([
    { left: '', right: '' },
    { left: '', right: '' },
    { left: '', right: '' },
    { left: '', right: '' },
  ]);
  const [answerKey, setAnswerKey] = useState('');
  const [gradingGuide, setGradingGuide] = useState('');

  useEffect(() => {
    if (initialQuestion) {
      setType(initialQuestion.type);
      setLevel(initialQuestion.level);
      setStrand(initialQuestion.strand || (subject === 'Toán' ? 'Số và phép tính' : 'Đọc hiểu văn bản'));
      setTopic(initialQuestion.topic || '');
      setCompetency(initialQuestion.competency || '');
      setPoints(initialQuestion.points);
      setContent(initialQuestion.content || '');
      if (initialQuestion.options && initialQuestion.options.length > 0) {
        setOptions(initialQuestion.options);
      }
      if (initialQuestion.subQuestions && initialQuestion.subQuestions.length > 0) {
        setSubQuestions(initialQuestion.subQuestions);
      }
      if (initialQuestion.matchingPairs && initialQuestion.matchingPairs.length > 0) {
        setMatchingPairs(initialQuestion.matchingPairs);
      }
      setAnswerKey(initialQuestion.answerKey || '');
      setGradingGuide(initialQuestion.gradingGuide || '');
    } else {
      // Default new question
      setType('mcq');
      setLevel('m1');
      setStrand(subject === 'Toán' ? 'Số và phép tính' : subject === 'Tiếng Việt' ? 'Đọc hiểu văn bản' : 'Địa lý các vùng miền');
      setTopic('');
      setCompetency('');
      setPoints(0.5);
      setContent('');
      setOptions([
        { label: 'A', text: '' },
        { label: 'B', text: '' },
        { label: 'C', text: '' },
        { label: 'D', text: '' },
      ]);
      setAnswerKey('');
      setGradingGuide('Khoanh đúng ý A/B/C/D được 0,5 điểm.');
    }
  }, [initialQuestion, isOpen, subject]);

  // Adjust defaults when type or level changes
  const handleTypeChange = (newType: QuestionType) => {
    setType(newType);
    if (newType !== 'essay') {
      // If user had M3 selected, demote to M2 because M3 MCQ is strictly forbidden!
      if (level === 'm3') {
        setLevel('m2');
      }
      if (newType === 'mcq') {
        setPoints(0.5);
      } else {
        setPoints(1.0);
      }
    } else {
      if (level === 'm1') setPoints(0.5);
      else if (level === 'm2') setPoints(1.0);
      else if (level === 'm3') setPoints(2.0);
    }
  };

  const handleLevelChange = (newLevel: CognitiveLevel) => {
    if (type !== 'essay' && newLevel === 'm3') {
      alert('Quy chế GDPT 2018: TUYỆT ĐỐI KHÔNG TẠO CÂU TRẮC NGHIỆM Ở MỨC VẬN DỤNG! Hãy chuyển sang hình thức Tự luận.');
      return;
    }
    setLevel(newLevel);
    if (type === 'essay') {
      if (newLevel === 'm1') setPoints(0.5);
      else if (newLevel === 'm2') setPoints(1.0);
      else if (newLevel === 'm3') setPoints(2.0);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi.');
      return;
    }

    const newQuestion: QuestionItem = {
      id: initialQuestion ? initialQuestion.id : `q-${Date.now()}`,
      order: initialQuestion ? initialQuestion.order : 999,
      type,
      level,
      strand,
      topic: topic || 'Kiến thức cốt lõi',
      competency: competency || 'Thực hiện được yêu cầu cần đạt theo chuẩn GDPT 2018',
      points: Number(points),
      content,
      options: type === 'mcq' ? options : undefined,
      subQuestions: type === 'true_false' || type === 'fill_blank' ? subQuestions : undefined,
      matchingPairs: type === 'matching' ? matchingPairs : undefined,
      answerKey,
      gradingGuide,
    };

    onSave(newQuestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {initialQuestion ? `Chỉnh sửa Câu ${initialQuestion.order}` : 'Thêm câu hỏi mới vào đề'}
            </h3>
            <p className="text-xs text-slate-500">
              Quy chuẩn: 1 câu hỏi tương ứng 1 dòng đặc tả trong Bản đặc tả
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Row 1: Type & Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dạng câu hỏi:</label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value="mcq">Trắc nghiệm Nhiều lựa chọn (NLC)</option>
                <option value="true_false">Trắc nghiệm Đúng - Sai (ĐS)</option>
                <option value="matching">Trắc nghiệm Nối cột (NC)</option>
                <option value="fill_blank">Trắc nghiệm Điền khuyết (ĐK)</option>
                <option value="essay">Tự luận (TL)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mức độ nhận thức:</label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => handleLevelChange('m1')}
                  className={`p-2 rounded-lg font-medium border text-center transition-colors ${
                    level === 'm1'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  M1 (Biết)
                </button>
                <button
                  type="button"
                  onClick={() => handleLevelChange('m2')}
                  className={`p-2 rounded-lg font-medium border text-center transition-colors ${
                    level === 'm2'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  M2 (Hiểu)
                </button>
                <button
                  type="button"
                  onClick={() => handleLevelChange('m3')}
                  disabled={type !== 'essay'}
                  title={
                    type !== 'essay'
                      ? 'Quy chế: Tuyệt đối không tạo trắc nghiệm ở Mức Vận dụng!'
                      : 'Mức 3 Vận dụng (Tự luận)'
                  }
                  className={`p-2 rounded-lg font-medium border text-center transition-colors ${
                    level === 'm3'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : type !== 'essay'
                      ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  M3 (Vận dụng)
                </button>
              </div>
            </div>
          </div>

          {type !== 'essay' && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                Quy định GDPT 2018: Câu trắc nghiệm chỉ xếp ở Mức 1 (Biết) hoặc Mức 2 (Hiểu). Mức 3 (Vận dụng) chỉ dành cho Tự luận.
              </span>
            </div>
          )}

          {/* Row 2: Strand, Topic, Points */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mạch kiến thức:</label>
              <input
                type="text"
                value={strand}
                onChange={(e) => setStrand(e.target.value)}
                placeholder="VD: Số và phép tính"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chủ đề / Bài học:</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="VD: Phép cộng và trừ"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Điểm số:</label>
              <input
                type="number"
                step="0.25"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
              />
              <span className="text-[10px] text-slate-500">
                (NLC: 0.5đ · ĐS/NC/ĐK: 0.25đ/ý · TL: 0.5-2.0đ)
              </span>
            </div>
          </div>

          {/* Competency (Yêu cầu cần đạt chuẩn GDPT 2018) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Yêu cầu cần đạt (Chuẩn GDPT 2018 để đưa vào Bản đặc tả):
            </label>
            <textarea
              rows={2}
              value={competency}
              onChange={(e) => setCompetency(e.target.value)}
              placeholder="VD: Nhận biết được giá trị theo vị trí của chữ số trong một số tự nhiên đến lớp triệu..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
            />
          </div>

          {/* Question Content */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nội dung câu hỏi (Đề bài):</label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung đề bài..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-serif text-sm"
              required
            />
          </div>

          {/* MCQ Options (4 options A, B, C, D) */}
          {type === 'mcq' && (
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">
                4 Phương án lựa chọn (A, B, C, D):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {options.map((opt, idx) => (
                  <div key={opt.label} className="flex items-center gap-2">
                    <span className="w-6 font-bold text-slate-700">{opt.label}.</span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[idx].text = e.target.value;
                        setOptions(newOpts);
                      }}
                      placeholder={`Phương án ${opt.label}`}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded p-1.5 font-serif"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-questions for True/False */}
          {type === 'true_false' && (
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">
                Các ý Đúng - Sai (a, b, c, d - mỗi ý 0,25đ):
              </label>
              {subQuestions.map((sq, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={sq}
                  onChange={(e) => {
                    const newSubs = [...subQuestions];
                    newSubs[idx] = e.target.value;
                    setSubQuestions(newSubs);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5"
                />
              ))}
            </div>
          )}

          {/* Answer Key & Grading Guide */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đáp án đúng:</label>
              <input
                type="text"
                value={answerKey}
                onChange={(e) => setAnswerKey(e.target.value)}
                placeholder="VD: C. 700 000"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hướng dẫn chấm / Biểu điểm:</label>
              <textarea
                rows={2}
                value={gradingGuide}
                onChange={(e) => setGradingGuide(e.target.value)}
                placeholder="VD: Khoanh đúng phương án C được 0,5 điểm..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
            >
              Lưu câu hỏi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
