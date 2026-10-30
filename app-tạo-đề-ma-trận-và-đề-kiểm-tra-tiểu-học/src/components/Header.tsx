import React from 'react';
import {
  FileText,
  Printer,
  Download,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Upload,
  BookOpen,
} from 'lucide-react';
import { ExamData } from '../types/exam';

interface HeaderProps {
  exam: ExamData;
  auditScore: number;
  onPrint: () => void;
  onExportDocx: () => void;
  onOpenAiModal: () => void;
  onOpenAuditTab: () => void;
  onResetSample: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  exam,
  auditScore,
  onPrint,
  onExportDocx,
  onOpenAiModal,
  onOpenAuditTab,
  onResetSample,
  onExportJson,
  onImportJson,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  APP TẠO ĐỀ MA TRẬN VÀ ĐỀ KIỂM TRA TIỂU HỌC
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  GDPT 2018 · TT 27
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Chuyên gia Xây dựng Ma trận 2 chiều · Bản đặc tả · Đề kiểm tra chuẩn quy cách · Hướng dẫn chấm
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Audit Status Button */}
            <button
              onClick={onOpenAuditTab}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                auditScore >= 90
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : auditScore >= 70
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
              title="Xem thẩm định chuẩn quy chế GDPT 2018"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Chuẩn quy chế: {auditScore}/100</span>
            </button>

            {/* AI Generator Button */}
            <button
              onClick={onOpenAiModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Trợ lý Khảo thí</span>
            </button>

            {/* Export Word (.docx) */}
            <button
              onClick={onExportDocx}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
              title="Xuất trọn bộ hồ sơ đề, ma trận, đặc tả và đáp án ra file Word"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Xuất file Word (.docx)</span>
            </button>

            {/* Print / PDF */}
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors"
              title="In trực tiếp hoặc Lưu PDF chuẩn trang A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In / Lưu PDF</span>
            </button>

            {/* JSON Save/Load & Reset Menu */}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
              <button
                onClick={onExportJson}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Lưu hồ sơ đề vào máy (JSON)"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border-l border-slate-200"
                title="Mở đề từ máy (JSON)"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onResetSample}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border-l border-slate-200"
                title="Tải lại bộ đề mẫu chuẩn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={onImportJson}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
