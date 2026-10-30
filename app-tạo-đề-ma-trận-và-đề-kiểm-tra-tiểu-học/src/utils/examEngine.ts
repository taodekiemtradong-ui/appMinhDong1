import {
  CognitiveLevel,
  ExamData,
  MatrixRow,
  MatrixSummary,
  QuestionItem,
  QuestionType,
  SpecificationItem,
  AuditReport,
} from '../types/exam';

/**
 * Priority rank for sorting questions according to strict GDPT 2018 guidelines:
 * 1. Trắc nghiệm trước:
 *    - Mức 1: Biết NLC -> Biết ĐS -> Biết NC -> Biết ĐK
 *    - Mức 2: Hiểu NLC -> Hiểu ĐS -> Hiểu NC -> Hiểu ĐK
 * 2. Tự luận sau:
 *    - Lần lượt: Mức 1 (Biết) -> Mức 2 (Hiểu) -> Mức 3 (Vận dụng)
 * Note: Mức 3 trắc nghiệm BỊ CẤM.
 */
export function getQuestionSortWeight(q: QuestionItem): number {
  const isTN = q.type !== 'essay';

  if (isTN) {
    // Trắc nghiệm
    const levelBase = q.level === 'm1' ? 100 : q.level === 'm2' ? 200 : 999; // m3 trắc nghiệm vi phạm quy chế
    let typeRank = 10;
    if (q.type === 'mcq') typeRank = 10; // Nhiều lựa chọn
    else if (q.type === 'true_false') typeRank = 20; // Đúng sai
    else if (q.type === 'matching') typeRank = 30; // Nối cột
    else if (q.type === 'fill_blank') typeRank = 40; // Điền khuyết

    return levelBase + typeRank;
  } else {
    // Tự luận
    if (q.level === 'm1') return 500; // Biết
    if (q.level === 'm2') return 600; // Hiểu
    return 700; // Vận dụng (m3)
  }
}

/**
 * Sorts questions according to the strict pedagogical sequence and assigns order 1..N
 */
export function sortExamQuestions(questions: QuestionItem[]): QuestionItem[] {
  const sorted = [...questions].sort((a, b) => {
    const weightA = getQuestionSortWeight(a);
    const weightB = getQuestionSortWeight(b);
    if (weightA !== weightB) return weightA - weightB;
    // Keep stable secondary order
    return (a.order || 0) - (b.order || 0);
  });

  return sorted.map((q, idx) => ({
    ...q,
    order: idx + 1,
  }));
}

/**
 * Counts words in a Vietnamese text string
 */
export function countWords(text: string): number {
  if (!text) return 0;
  const cleaned = text.trim().replace(/\s+/g, ' ');
  if (!cleaned) return 0;
  return cleaned.split(' ').length;
}

/**
 * Human-readable question type label
 */
export function getQuestionTypeLabel(type: QuestionType, level: CognitiveLevel): string {
  const levelText = level === 'm1' ? 'Biết' : level === 'm2' ? 'Hiểu' : 'Vận dụng';
  switch (type) {
    case 'mcq':
      return `TN Nhiều lựa chọn (${levelText})`;
    case 'true_false':
      return `TN Đúng - Sai (${levelText})`;
    case 'matching':
      return `TN Nối cột (${levelText})`;
    case 'fill_blank':
      return `TN Điền khuyết (${levelText})`;
    case 'essay':
      return `Tự luận (${levelText})`;
    default:
      return 'Câu hỏi';
  }
}

/**
 * Formats points into Vietnamese standard string (e.g. 0,5 điểm / 1,0 điểm / 2,0 điểm)
 */
export function formatPoints(points: number): string {
  const str = points % 1 === 0 ? points.toFixed(1) : points.toString();
  return str.replace('.', ',');
}

/**
 * Calculates the two-dimensional matrix according to GDPT 2018 standards
 */
export function calculateMatrix(questions: QuestionItem[]): MatrixSummary {
  const rowsMap = new Map<string, MatrixRow>();

  // Initialize and group questions by strand + topic
  for (const q of questions) {
    const key = `${q.strand}:::${q.topic}`;
    if (!rowsMap.has(key)) {
      rowsMap.set(key, {
        strand: q.strand || 'Chung',
        topic: q.topic || 'Kiến thức cốt lõi',
        m1_tn: { count: 0, points: 0, questionNumbers: [] },
        m1_tl: { count: 0, points: 0, questionNumbers: [] },
        m2_tn: { count: 0, points: 0, questionNumbers: [] },
        m2_tl: { count: 0, points: 0, questionNumbers: [] },
        m3_tl: { count: 0, points: 0, questionNumbers: [] },
        total_count: 0,
        total_points: 0,
        percentage: 0,
      });
    }

    const row = rowsMap.get(key)!;
    const isTN = q.type !== 'essay';
    const pts = q.points || 0;

    if (q.level === 'm1') {
      if (isTN) {
        row.m1_tn.count += 1;
        row.m1_tn.points += pts;
        row.m1_tn.questionNumbers.push(q.order);
      } else {
        row.m1_tl.count += 1;
        row.m1_tl.points += pts;
        row.m1_tl.questionNumbers.push(q.order);
      }
    } else if (q.level === 'm2') {
      if (isTN) {
        row.m2_tn.count += 1;
        row.m2_tn.points += pts;
        row.m2_tn.questionNumbers.push(q.order);
      } else {
        row.m2_tl.count += 1;
        row.m2_tl.points += pts;
        row.m2_tl.questionNumbers.push(q.order);
      }
    } else {
      // M3 is essay only
      row.m3_tl.count += 1;
      row.m3_tl.points += pts;
      row.m3_tl.questionNumbers.push(q.order);
    }

    row.total_count += 1;
    row.total_points += pts;
  }

  const rows = Array.from(rowsMap.values());
  const grandTotalPoints = rows.reduce((acc, r) => acc + r.total_points, 0) || 10;
  const grandTotalQuestions = rows.reduce((acc, r) => acc + r.total_count, 0);

  // Compute percentage for each row
  for (const r of rows) {
    r.percentage = grandTotalPoints > 0 ? Math.round((r.total_points / grandTotalPoints) * 100) : 0;
  }

  // Summary totals
  let totalM1Points = 0;
  let totalM2Points = 0;
  let totalM3Points = 0;
  let totalTNPoints = 0;
  let totalTLPoints = 0;

  for (const r of rows) {
    totalM1Points += r.m1_tn.points + r.m1_tl.points;
    totalM2Points += r.m2_tn.points + r.m2_tl.points;
    totalM3Points += r.m3_tl.points;
    totalTNPoints += r.m1_tn.points + r.m2_tn.points;
    totalTLPoints += r.m1_tl.points + r.m2_tl.points + r.m3_tl.points;
  }

  const m1Percentage = grandTotalPoints > 0 ? Math.round((totalM1Points / grandTotalPoints) * 100) : 0;
  const m2Percentage = grandTotalPoints > 0 ? Math.round((totalM2Points / grandTotalPoints) * 100) : 0;
  const m3Percentage = grandTotalPoints > 0 ? Math.round((totalM3Points / grandTotalPoints) * 100) : 0;
  const tnPercentage = grandTotalPoints > 0 ? Math.round((totalTNPoints / grandTotalPoints) * 100) : 0;
  const tlPercentage = grandTotalPoints > 0 ? Math.round((totalTLPoints / grandTotalPoints) * 100) : 0;

  return {
    rows,
    totalM1Points,
    totalM2Points,
    totalM3Points,
    m1Percentage,
    m2Percentage,
    m3Percentage,
    totalTNPoints,
    totalTLPoints,
    tnPercentage,
    tlPercentage,
    grandTotalPoints,
    grandTotalQuestions,
  };
}

/**
 * Extracts specification items: 1 question = 1 specification row
 */
export function generateSpecifications(questions: QuestionItem[]): SpecificationItem[] {
  return questions.map((q, idx) => ({
    stt: idx + 1,
    strand: q.strand,
    topic: q.topic,
    level: q.level,
    competency: q.competency,
    questionType: q.type,
    questionFormatLabel: getQuestionTypeLabel(q.type, q.level),
    questionNumber: q.order,
    points: q.points,
  }));
}

/**
 * Comprehensive Audit against GDPT 2018 & Circular 27 guidelines
 */
export function auditExamLocally(exam: ExamData): AuditReport {
  const checks: AuditReport['checks'] = [];
  const recommendations: string[] = [];
  let deduction = 0;

  // Check 1: Continuous question numbering from 1 to N
  const questions = exam.questions;
  let isNumberingSequential = true;
  for (let i = 0; i < questions.length; i++) {
    if (questions[i].order !== i + 1) {
      isNumberingSequential = false;
      break;
    }
  }

  checks.push({
    name: 'Thứ tự đánh số câu liên tục',
    description: 'Đánh số liên tục từ Câu 1 đến câu cuối cùng của đề',
    status: isNumberingSequential ? 'pass' : 'fail',
    details: isNumberingSequential
      ? `Đã đánh số liên tục từ Câu 1 đến Câu ${questions.length}.`
      : 'Thứ tự câu hỏi bị gián đoạn hoặc không bắt đầu từ Câu 1.',
  });
  if (!isNumberingSequential) deduction += 15;

  // Check 2: NO multiple choice at Level 3 (Vận dụng) - CRITICAL RULE
  const m3MCQ = questions.filter((q) => q.level === 'm3' && q.type !== 'essay');
  const hasM3MCQ = m3MCQ.length > 0;
  checks.push({
    name: 'Không tạo trắc nghiệm Mức 3 (Vận dụng)',
    description: 'Tuyệt đối không ra câu hỏi trắc nghiệm ở mức độ Vận dụng',
    status: !hasM3MCQ ? 'pass' : 'fail',
    details: !hasM3MCQ
      ? 'Đạt chuẩn: Tất cả câu trắc nghiệm đều ở Mức 1 (Biết) và Mức 2 (Hiểu).'
      : `VI PHẠM QUY CHẾ: Phát hiện ${m3MCQ.length} câu trắc nghiệm ở Mức 3 (Câu ${m3MCQ.map((q) => q.order).join(', ')}). Cần chuyển sang tự luận hoặc hạ mức!`,
  });
  if (hasM3MCQ) {
    deduction += 30;
    recommendations.push('Chuyển các câu trắc nghiệm Mức 3 thành Tự luận hoặc hạ xuống Mức 2 theo đúng quy định.');
  }

  // Check 3: Sequence of question types
  // TN M1 (NLC -> ĐS -> NC -> ĐK) -> TN M2 (NLC -> ĐS -> NC -> ĐK) -> TL M1 -> TL M2 -> TL M3
  let isOrderPedagogicallyCorrect = true;
  for (let i = 0; i < questions.length - 1; i++) {
    const w1 = getQuestionSortWeight(questions[i]);
    const w2 = getQuestionSortWeight(questions[i + 1]);
    if (w1 > w2) {
      isOrderPedagogicallyCorrect = false;
      break;
    }
  }

  checks.push({
    name: 'Trình tự sư phạm: TN trước, TL sau; M1 -> M2 -> M3',
    description: 'Sắp xếp TN M1 (NLC-ĐS-NC-ĐK) -> TN M2 (NLC-ĐS-NC-ĐK) -> TL M1 -> TL M2 -> TL M3',
    status: isOrderPedagogicallyCorrect ? 'pass' : 'warn',
    details: isOrderPedagogicallyCorrect
      ? 'Đạt chuẩn: Các câu hỏi được sắp xếp đúng thứ tự sư phạm từ dễ đến khó.'
      : 'Thứ tự câu hỏi chưa chuẩn theo quy định (ví dụ: tự luận xen kẽ trắc nghiệm hoặc mức khó xếp trước mức dễ). Hãy bấm nút "Sắp xếp tự động".',
  });
  if (!isOrderPedagogicallyCorrect) {
    deduction += 10;
    recommendations.push('Nhấp vào nút "Sắp xếp theo quy chuẩn" để hệ thống tự động đưa các câu về đúng vị trí sư phạm.');
  }

  // Check 4: Cognitive Level Percentages (M1: 50%, M2: 30%, M3: 20%)
  const matrix = calculateMatrix(questions);
  const totalPts = matrix.grandTotalPoints;

  if (exam.subject === 'Toán' || exam.subject === 'Lịch sử và Địa lý') {
    const isLevelRatioOk =
      Math.abs(matrix.m1Percentage - 50) <= 5 &&
      Math.abs(matrix.m2Percentage - 30) <= 5 &&
      Math.abs(matrix.m3Percentage - 20) <= 5;

    checks.push({
      name: `Tỉ lệ mức độ nhận thức (M1-M2-M3: 50% - 30% - 20%)`,
      description: 'Quy chuẩn phân bố mức độ nhận thức cho môn Toán và Lịch sử & Địa lý',
      status: isLevelRatioOk ? 'pass' : 'warn',
      details: `Hiện tại: M1: ${matrix.m1Percentage}% (${matrix.totalM1Points}đ) | M2: ${matrix.m2Percentage}% (${matrix.totalM2Points}đ) | M3: ${matrix.m3Percentage}% (${matrix.totalM3Points}đ). ${
        isLevelRatioOk ? 'Phù hợp tỉ lệ 50 - 30 - 20%.' : 'Chênh lệch so với khung chuẩn 50 - 30 - 20%.'
      }`,
    });
    if (!isLevelRatioOk) {
      deduction += 10;
      recommendations.push('Điều chỉnh điểm hoặc số lượng câu hỏi để tiệm cận tỉ lệ M1 (50%) - M2 (30%) - M3 (20%).');
    }

    // Ratio TN / TL (60% / 40%)
    const isTnTlRatioOk = Math.abs(matrix.tnPercentage - 60) <= 5 && Math.abs(matrix.tlPercentage - 40) <= 5;
    checks.push({
      name: 'Tỉ lệ hình thức: Trắc nghiệm 60% (6đ) - Tự luận 40% (4đ)',
      description: 'Định mức điểm trắc nghiệm và tự luận đối với tổng 10 điểm',
      status: isTnTlRatioOk ? 'pass' : 'warn',
      details: `Hiện tại: Trắc nghiệm ${matrix.tnPercentage}% (${matrix.totalTNPoints}đ) - Tự luận ${matrix.tlPercentage}% (${matrix.totalTLPoints}đ).`,
    });
    if (!isTnTlRatioOk) {
      deduction += 10;
      recommendations.push('Cân đối lại số câu trắc nghiệm (chuẩn 6 điểm) và tự luận (chuẩn 4 điểm).');
    }
  }

  // Check 5: Special checks for Vietnamese Language (Tiếng Việt)
  if (exam.subject === 'Tiếng Việt') {
    const has11Questions = questions.length === 11;
    checks.push({
      name: 'Số lượng câu đọc hiểu Tiếng Việt (11 câu = 7 điểm)',
      description: 'Phần đọc hiểu môn Tiếng Việt gồm đúng 11 câu (Đọc hiểu VB 4đ + KTTV 3đ)',
      status: has11Questions ? 'pass' : 'warn',
      details: has11Questions
        ? 'Đạt chuẩn: Đúng 11 câu hỏi đọc hiểu và kiến thức tiếng Việt.'
        : `Hiện có ${questions.length} câu (quy định chuẩn gồm 11 câu = 7 điểm).`,
    });
    if (!has11Questions) {
      deduction += 10;
      recommendations.push('Đảm bảo phần Đọc hiểu có 11 câu (4 câu TN + 2 câu TL đọc hiểu VB; 4 câu TN + 1 câu TL KTTV).');
    }

    if (exam.readingPassage) {
      const words = countWords(exam.readingPassage.text);
      const genre = exam.readingPassage.genre;
      let minWords = 280;
      let maxWords = 330;
      let genreName = 'Truyện, kịch bản (280 - 330 chữ)';

      if (genre === 'description') {
        minWords = 200;
        maxWords = 250;
        genreName = 'Bài miêu tả (200 - 250 chữ)';
      } else if (genre === 'poem') {
        minWords = 100;
        maxWords = 120;
        genreName = 'Thơ (100 - 120 chữ)';
      } else if (genre === 'info') {
        minWords = 150;
        maxWords = 180;
        genreName = 'Văn bản thông tin (150 - 180 chữ)';
      }

      const isWordCountOk = words >= minWords - 20 && words <= maxWords + 20;
      checks.push({
        name: `Độ dài văn bản đọc ngoài SGK: ${genreName}`,
        description: `Quy chuẩn độ dài bài đọc lớp 4 theo Chương trình GDPT 2018`,
        status: isWordCountOk ? 'pass' : 'warn',
        details: `Văn bản hiện có ${words} chữ. ${
          isWordCountOk ? 'Nằm trong khung quy chuẩn.' : `Chưa tối ưu so với khoảng ${minWords} - ${maxWords} chữ.`
        }`,
      });
      if (!isWordCountOk) {
        recommendations.push(`Điều chỉnh độ dài văn bản đọc để nằm trong khoảng chuẩn ${minWords} - ${maxWords} chữ.`);
      }
    }
  }

  // Check 6: Point allocations
  let pointIssues = 0;
  for (const q of questions) {
    if (q.type === 'mcq' && q.points !== 0.5) pointIssues++;
    if (q.type === 'essay' && q.level === 'm1' && q.points !== 0.5) pointIssues++;
    if (q.type === 'essay' && q.level === 'm2' && q.points !== 1.0) pointIssues++;
  }
  checks.push({
    name: 'Định mức điểm thành phần từng dạng câu',
    description: 'TN nhiều lựa chọn: 0,5đ; TN ĐS/NC/ĐK: 0,25đ/ý; TL M1: 0,5đ; TL M2: 1,0đ; TL M3: 1,0-2,0đ',
    status: pointIssues === 0 ? 'pass' : 'warn',
    details: pointIssues === 0
      ? 'Tất cả câu hỏi tuân thủ đúng định mức điểm thành phần.'
      : `Có ${pointIssues} câu hỏi có mức điểm chưa sát quy định chuẩn (TN NLC nên là 0,5đ; TL M1: 0,5đ; TL M2: 1,0đ).`,
  });

  const finalScore = Math.max(0, 100 - deduction);

  return {
    score: finalScore,
    passed: finalScore >= 80 && !hasM3MCQ && isNumberingSequential,
    checks,
    recommendations,
  };
}
