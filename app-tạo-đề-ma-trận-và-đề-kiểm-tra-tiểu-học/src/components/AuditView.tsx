import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Bot,
  Loader2,
} from 'lucide-react';
import { AuditReport, ExamData } from '../types/exam';
import { auditExamLocally } from '../utils/examEngine';

interface AuditViewProps {
  exam: ExamData;
  onAutoSortAndFix: () => void;
}

export const AuditView: React.FC<AuditViewProps> = ({ exam, onAutoSortAndFix }) => {
  const localReport = auditExamLocally(exam);
  const [aiReport, setAiReport] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleDeepAudit = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/audit-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examData: exam }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Không thể thẩm định.');
      }
      setAiReport(data.data);
    } catch (err: any) {
      setAiError(err.message || 'Lỗi kết nối tới AI Thẩm định.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 my-6 font-sans">
      {/* Top Banner with Score */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner ${
              localReport.score >= 90
                ? 'bg-emerald-100 text-emerald-800'
                : localReport.score >= 70
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {localReport.score}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Thẩm định Chuẩn Khảo thí &amp; GDPT 2018
              </h2>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  localReport.passed
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {localReport.passed ? 'ĐẠT CHUẨN QUY CHẾ' : 'CẦN ĐIỀU CHỈNH'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Kiểm tra tự động theo Thông tư 27/2020/TT-BGDĐT và Quy chế xây dựng ma trận, đặc tả của Bộ GD&amp;ĐT.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={onAutoSortAndFix}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tự động chuẩn hóa thứ tự</span>
          </button>
          <button
            onClick={handleDeepAudit}
            disabled={loadingAi}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 shadow-xs transition-colors"
          >
            {loadingAi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>AI Thẩm định chuyên sâu</span>
          </button>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Bảng tiêu chuẩn kiểm định định kì
        </h3>

        <div className="space-y-3">
          {localReport.checks.map((check, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border flex items-start gap-3 transition-colors ${
                check.status === 'pass'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : check.status === 'warn'
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-rose-50/60 border-rose-200'
              }`}
            >
              <div className="mt-0.5">
                {check.status === 'pass' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
                {check.status === 'warn' && (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
                {check.status === 'fail' && (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">{check.name}</h4>
                  <span
                    className={`font-semibold uppercase text-[10px] ${
                      check.status === 'pass'
                        ? 'text-emerald-700'
                        : check.status === 'warn'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {check.status === 'pass'
                      ? 'Đạt'
                      : check.status === 'warn'
                      ? 'Khuyến nghị'
                      : 'Vi phạm'}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5">{check.description}</p>
                <div className="mt-1 font-medium text-slate-800">{check.details}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Deep Audit Result */}
      {aiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
          {aiError}
        </div>
      )}

      {aiReport && (
        <div className="bg-white border border-indigo-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
            <Bot className="w-5 h-5 text-indigo-600" />
            <span>Ý kiến Thẩm định của AI Thanh tra Khảo thí Sở GD&amp;ĐT</span>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-lg text-xs text-indigo-950 font-medium">
            {aiReport.summary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <h5 className="font-bold text-emerald-900 mb-1">Điểm cộng đạt chuẩn:</h5>
              <ul className="list-disc list-inside space-y-1 text-emerald-800">
                {aiReport.passedCriteria?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <h5 className="font-bold text-amber-900 mb-1">Khuyến nghị hoàn thiện:</h5>
              <ul className="list-disc list-inside space-y-1 text-amber-800">
                {aiReport.recommendations?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
