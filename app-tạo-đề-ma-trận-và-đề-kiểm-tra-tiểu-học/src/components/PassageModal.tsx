import React, { useState } from 'react';
import { X, Sparkles, Loader2, BookOpen, Check, AlertCircle } from 'lucide-react';
import { ReadingPassage } from '../types/exam';
import { countWords } from '../utils/examEngine';

interface PassageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (passage: ReadingPassage) => void;
  initialPassage?: ReadingPassage;
}

export const PassageModal: React.FC<PassageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPassage,
}) => {
  const [title, setTitle] = useState(initialPassage?.title || 'HẠT DẺ CỦA SÓC NÂU');
  const [author, setAuthor] = useState(initialPassage?.author || 'Theo Phong Thu');
  const [genre, setGenre] = useState<ReadingPassage['genre']>(initialPassage?.genre || 'story');
  const [text, setText] = useState(initialPassage?.text || '');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiTopic, setAiTopic] = useState('Tình bạn, lòng sẻ chia, giúp đỡ nhau trong khó khăn');

  if (!isOpen) return null;

  const currentWords = countWords(text);

  let minWords = 280;
  let maxWords = 330;
  let genreLabel = 'Truyện, kịch bản (280 – 330 chữ)';
  if (genre === 'description') {
    minWords = 200;
    maxWords = 250;
    genreLabel = 'Bài miêu tả (200 – 250 chữ)';
  } else if (genre === 'poem') {
    minWords = 100;
    maxWords = 120;
    genreLabel = 'Thơ (100 – 120 chữ)';
  } else if (genre === 'info') {
    minWords = 150;
    maxWords = 180;
    genreLabel = 'Văn bản thông tin (150 – 180 chữ)';
  }

  const isWordCountCompliant = currentWords >= minWords - 15 && currentWords <= maxWords + 15;

  const handleGenerateAiPassage = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/generate-passage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: genreLabel,
          topic: aiTopic,
          targetWords: Math.round((minWords + maxWords) / 2),
        }),
      });
      const data = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Lỗi khi tạo bài đọc.');
      }
      const passageData = data.data;
      setTitle(passageData.title || 'BÀI ĐỌC MỚI');
      setAuthor(passageData.author || 'Sưu tầm');
      setText(passageData.text || '');
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối AI.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSave = () => {
    onSave({
      title: title.trim().toUpperCase(),
      author: author.trim(),
      genre,
      text: text.trim(),
      wordCount: currentWords,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Biên Soạn Ngữ Liệu Đọc Ngoài SGK Lớp 4
              </h3>
              <p className="text-xs text-amber-800">
                Tuân thủ quy chuẩn số lượng chữ theo Chương trình GDPT 2018
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

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Genre selector & word count live tracker */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Thể loại văn bản:</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value="story">Truyện, kịch bản (280 – 330 chữ)</option>
                <option value="description">Bài miêu tả (200 – 250 chữ)</option>
                <option value="poem">Thơ thiếu nhi (100 – 120 chữ)</option>
                <option value="info">Văn bản thông tin (150 – 180 chữ)</option>
              </select>
            </div>

            <div className="p-3 rounded-lg border flex flex-col justify-between bg-slate-50">
              <span className="font-semibold text-slate-700">Đếm số chữ tự động:</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg font-bold text-slate-900">{currentWords} chữ</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    isWordCountCompliant
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isWordCountCompliant ? 'Đạt chuẩn' : `Khung: ${minWords} - ${maxWords} chữ`}
                </span>
              </div>
            </div>
          </div>

          {/* AI Generator Helper Bar */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sinh văn bản mới bằng AI đúng chuẩn số chữ:</span>
              </span>
              <button
                type="button"
                onClick={handleGenerateAiPassage}
                disabled={loadingAi}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium flex items-center gap-1 shadow-xs disabled:opacity-50"
              >
                {loadingAi ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Tạo bài đọc</span>
              </button>
            </div>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="Chủ đề: Tình cảm bạn bè, thiên nhiên quê hương, bài học cuộc sống..."
              className="w-full bg-white border border-indigo-200 rounded p-1.5 text-xs text-slate-800"
            />
          </div>

          {/* Title & Author */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên bài đọc (In hoa):</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: HẠT DẺ CỦA SÓC NÂU"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tác giả / Nguồn:</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="VD: Theo Phong Thu"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
              />
            </div>
          </div>

          {/* Text Content */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nội dung bài đọc:</label>
            <textarea
              rows={9}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhập nội dung bài đọc..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 font-serif text-[14px] leading-relaxed text-slate-800"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
            >
              Áp dụng vào đề thi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
