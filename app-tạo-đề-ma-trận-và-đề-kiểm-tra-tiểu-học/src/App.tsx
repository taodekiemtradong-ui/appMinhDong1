import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ExamData, PeriodType, QuestionItem } from './types/exam';
import { sampleExams } from './data/sampleExams';
import { auditExamLocally, sortExamQuestions } from './utils/examEngine';
import { exportExamToDocx } from './utils/docxExport';
import { Header } from './components/Header';
import { ExamToolbar } from './components/ExamToolbar';
import { ExamPaperView } from './components/ExamPaperView';
import { MatrixView } from './components/MatrixView';
import { SpecificationView } from './components/SpecificationView';
import { GradingGuideView } from './components/GradingGuideView';
import { AuditView } from './components/AuditView';
import { QuestionModal } from './components/QuestionModal';
import { AiGenerateModal } from './components/AiGenerateModal';
import { PassageModal } from './components/PassageModal';

export default function App() {
  // Load saved exam or fallback to Grade 4 Math GKI
  const [exam, setExam] = useState<ExamData>(() => {
    const saved = localStorage.getItem('gdpt2018_exam_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved exam:', e);
      }
    }
    return sampleExams['math-g4-gki'];
  });

  const [activeTab, setActiveTab] = useState<'paper' | 'matrix' | 'specs' | 'rubric' | 'audit'>('paper');

  // Modals state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPassageModalOpen, setIsPassageModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('gdpt2018_exam_data', JSON.stringify(exam));
    } catch (e) {
      console.warn('LocalStorage limit exceeded:', e);
    }
  }, [exam]);

  // Realtime Audit calculation
  const auditReport = auditExamLocally(exam);

  // Sorting questions strictly according to pedagogical law:
  // TN M1 (NLC -> ĐS -> NC -> ĐK) -> TN M2 (NLC -> ĐS -> NC -> ĐK) -> TL M1 -> TL M2 -> TL M3
  const handleSortQuestions = () => {
    const sorted = sortExamQuestions(exam.questions);
    setExam((prev) => ({
      ...prev,
      questions: sorted,
    }));
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  const handleUpdateExamField = (field: keyof ExamData, value: any) => {
    setExam((prev) => {
      const updated = { ...prev, [field]: value };
      // If switching to Vietnamese and doesn't have a passage, import default
      if (field === 'subject' && value === 'Tiếng Việt' && !prev.readingPassage) {
        const sampleTv = sampleExams['vietnamese-g4-gki'];
        updated.readingPassage = sampleTv.readingPassage;
        updated.writingSection = sampleTv.writingSection;
      }
      return updated;
    });
  };

  const handleSelectSampleExam = (key: string) => {
    if (sampleExams[key]) {
      setExam(sampleExams[key]);
      confetti({ particleCount: 50, spread: 55, origin: { y: 0.6 } });
    }
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (q: QuestionItem) => {
    setEditingQuestion(q);
    setIsQuestionModalOpen(true);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Thầy/Cô có chắc chắn muốn xóa câu hỏi này khỏi đề thi không?')) {
      const filtered = exam.questions.filter((q) => q.id !== id);
      setExam((prev) => ({
        ...prev,
        questions: sortExamQuestions(filtered),
      }));
    }
  };

  const handleDuplicateQuestion = (q: QuestionItem) => {
    const duplicated: QuestionItem = {
      ...q,
      id: `q-dup-${Date.now()}`,
      order: exam.questions.length + 1,
      content: `${q.content} (Bản sao)`,
    };
    setExam((prev) => ({
      ...prev,
      questions: sortExamQuestions([...prev.questions, duplicated]),
    }));
  };

  const handleSaveQuestion = (q: QuestionItem) => {
    setExam((prev) => {
      let updatedList = [...prev.questions];
      const existingIdx = updatedList.findIndex((item) => item.id === q.id);
      if (existingIdx >= 0) {
        updatedList[existingIdx] = q;
      } else {
        updatedList.push(q);
      }
      return {
        ...prev,
        questions: sortExamQuestions(updatedList),
      };
    });
  };

  const handleSavePassage = (passage: any) => {
    setExam((prev) => ({
      ...prev,
      readingPassage: passage,
    }));
  };

  // Export to Microsoft Word (.docx)
  const handleExportDocx = async () => {
    try {
      const blob = await exportExamToDocx(exam);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanSubject = exam.subject.replace(/\s+/g, '_');
      a.download = `De_kiem_tra_${cleanSubject}_Lop${exam.grade}_${exam.period}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Lỗi khi xuất Word:', err);
      alert('Không thể xuất file Word: ' + err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exam, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Ho_so_de_${exam.subject}_Lop${exam.grade}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          setExam(parsed);
          alert('Đã nạp hồ sơ đề thi thành công!');
        } else {
          alert('Tệp JSON không đúng định dạng hồ sơ đề thi GDPT 2018.');
        }
      } catch (err) {
        alert('Không thể đọc file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetSample = () => {
    if (confirm('Thầy/Cô có muốn đặt lại dữ liệu đề thi mẫu chuẩn ban đầu không?')) {
      const defaultSample =
        exam.subject === 'Tiếng Việt'
          ? sampleExams['vietnamese-g4-gki']
          : exam.subject === 'Lịch sử và Địa lý'
          ? sampleExams['history-geo-g4-gki']
          : sampleExams['math-g4-gki'];
      setExam(defaultSample);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* App Header */}
      <Header
        exam={exam}
        auditScore={auditReport.score}
        onPrint={handlePrint}
        onExportDocx={handleExportDocx}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenAuditTab={() => setActiveTab('audit')}
        onResetSample={handleResetSample}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />

      {/* Control Bar & Navigation Tabs */}
      <ExamToolbar
        exam={exam}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onUpdateExamField={handleUpdateExamField}
        onSelectSampleExam={handleSelectSampleExam}
        onSortQuestions={handleSortQuestions}
        onOpenAddQuestion={handleOpenAddQuestion}
        onOpenPassageModal={() => setIsPassageModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {activeTab === 'paper' && (
          <ExamPaperView
            exam={exam}
            onEditQuestion={handleEditQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onDuplicateQuestion={handleDuplicateQuestion}
            onOpenPassageModal={() => setIsPassageModalOpen(true)}
          />
        )}

        {activeTab === 'matrix' && <MatrixView exam={exam} />}

        {activeTab === 'specs' && <SpecificationView exam={exam} />}

        {activeTab === 'rubric' && <GradingGuideView exam={exam} />}

        {activeTab === 'audit' && (
          <AuditView exam={exam} onAutoSortAndFix={handleSortQuestions} />
        )}
      </main>

      {/* Modals */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onSave={handleSaveQuestion}
        initialQuestion={editingQuestion}
        subject={exam.subject}
      />

      <AiGenerateModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onExamGenerated={(newExam) => {
          setExam(newExam);
          setActiveTab('paper');
        }}
        currentSubject={exam.subject}
        currentGrade={exam.grade}
        currentBookSeries={exam.bookSeries}
        currentPeriod={exam.period}
      />

      <PassageModal
        isOpen={isPassageModalOpen}
        onClose={() => setIsPassageModalOpen(false)}
        onSave={handleSavePassage}
        initialPassage={exam.readingPassage}
      />
    </div>
  );
}
