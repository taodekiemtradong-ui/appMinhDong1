import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
} from 'docx';
import { ExamData } from '../types/exam';
import { calculateMatrix, formatPoints, generateSpecifications } from './examEngine';

export async function exportExamToDocx(exam: ExamData): Promise<Blob> {
  const matrix = calculateMatrix(exam.questions);
  const specs = generateSpecifications(exam.questions);

  const font = 'Times New Roman';
  const normalSize = 26; // 13pt
  const headingSize = 28; // 14pt
  const smallSize = 22; // 11pt

  // Helper for text run
  const text = (str: string, opts?: { bold?: boolean; italics?: boolean; size?: number }) =>
    new TextRun({
      text: str,
      font,
      size: opts?.size || normalSize,
      bold: opts?.bold || false,
      italics: opts?.italics || false,
    });

  const children: any[] = [];

  // ==========================================
  // SECTION 1: OFFICIAL EXAM HEADER TABLE
  // ==========================================
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [text(exam.district.toUpperCase(), { size: smallSize })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [text(exam.school.toUpperCase(), { bold: true, size: normalSize })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [text('-------------------', { size: smallSize })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [text(exam.title, { bold: true, size: headingSize })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  text(
                    `MÔN: ${exam.subject.toUpperCase()} - LỚP ${exam.grade} (${exam.bookSeries})`,
                    { bold: true, size: normalSize }
                  ),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  text(`Năm học: ${exam.academicYear} - Thời gian: ${exam.duration} phút`, {
                    italics: true,
                    size: normalSize,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  children.push(headerTable);
  children.push(new Paragraph({ children: [text('')] }));

  // Student Info Box
  children.push(
    new Paragraph({
      children: [
        text('Họ và tên học sinh: ....................................................................... Lớp: 4.......', {
          size: normalSize,
        }),
      ],
    })
  );

  // Score Box
  const scoreTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [text('ĐIỂM SỐ', { bold: true, size: normalSize })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [text('\n\n\n')],
              }),
            ],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [text('LỜI NHẬN XÉT CỦA GIÁO VIÊN', { bold: true, size: normalSize })],
              }),
              new Paragraph({
                children: [text('.......................................................................................................................')],
              }),
              new Paragraph({
                children: [text('.......................................................................................................................')],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  children.push(scoreTable);
  children.push(new Paragraph({ children: [text('')] }));

  // ==========================================
  // READING PASSAGE (IF VIETNAMESE)
  // ==========================================
  if (exam.readingPassage) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [text(exam.readingPassage.title.toUpperCase(), { bold: true, size: headingSize })],
      })
    );

    const paragraphs = exam.readingPassage.text.split('\n\n');
    for (const p of paragraphs) {
      if (p.trim()) {
        children.push(
          new Paragraph({
            indent: { firstLine: 360 },
            children: [text(p.trim(), { size: normalSize })],
          })
        );
      }
    }

    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [text(`(${exam.readingPassage.author} - Độ dài: ${exam.readingPassage.wordCount} chữ)`, { italics: true, size: smallSize })],
      })
    );
    children.push(new Paragraph({ children: [text('')] }));

    children.push(
      new Paragraph({
        children: [
          text(
            'Dựa vào nội dung bài đọc trên, em hãy khoanh tròn vào chữ cái trước câu trả lời đúng và hoàn thành các bài tập sau:',
            { italics: true, size: normalSize }
          ),
        ],
      })
    );
    children.push(new Paragraph({ children: [text('')] }));
  }

  // ==========================================
  // QUESTIONS: EXACT SPECIFICATION
  // Rule: Câu 1 (bold), (0,5 điểm): (italic not bold), Question content (normal)
  // NO "Trắc nghiệm" / "Tự luận" titles!
  // Options indented 1cm (720 twips)
  // ==========================================
  for (const q of exam.questions) {
    const ptsText = `(${formatPoints(q.points)} điểm): `;

    children.push(
      new Paragraph({
        children: [
          text(`Câu ${q.order}`, { bold: true }),
          text(ptsText, { italics: true }),
          text(q.content),
        ],
      })
    );

    // MCQ Options: Indented 1 tab (approx 1cm = 567 - 720 twips)
    if (q.type === 'mcq' && q.options && q.options.length > 0) {
      const optChildren: any[] = [];
      q.options.forEach((opt, idx) => {
        optChildren.push(text(`${opt.label}. `, { bold: true }));
        optChildren.push(text(`${opt.text}        `));
      });

      children.push(
        new Paragraph({
          indent: { left: 720 },
          children: optChildren,
        })
      );
    }

    // Sub-questions (True/False or Fill Blank)
    if (q.subQuestions && q.subQuestions.length > 0) {
      for (const sq of q.subQuestions) {
        children.push(
          new Paragraph({
            indent: { left: 360 },
            children: [text(sq)],
          })
        );
      }
    }

    // Matching pairs
    if (q.matchingPairs && q.matchingPairs.length > 0) {
      for (let i = 0; i < q.matchingPairs.length; i++) {
        const p = q.matchingPairs[i];
        children.push(
          new Paragraph({
            indent: { left: 360 },
            children: [
              text(`Cột A (${i + 1}): `, { bold: true }),
              text(`${p.left}       --->       `),
              text(`Cột B: `, { bold: true }),
              text(p.right),
            ],
          })
        );
      }
    }

    // Essay answering blank lines
    if (q.type === 'essay') {
      const numLines = q.level === 'm3' ? 6 : q.level === 'm2' ? 4 : 2;
      for (let i = 0; i < numLines; i++) {
        children.push(
          new Paragraph({
            children: [text('................................................................................................................................................................................')],
          })
        );
      }
    }

    children.push(new Paragraph({ children: [text('')] }));
  }

  // Writing section if available (Vietnamese)
  if (exam.writingSection) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [text(exam.writingSection.title, { bold: true, size: headingSize })],
      })
    );
    children.push(
      new Paragraph({
        children: [text(exam.writingSection.prompt, { bold: true, size: normalSize })],
      })
    );
    for (let i = 0; i < 10; i++) {
      children.push(
        new Paragraph({
          children: [text('................................................................................................................................................................................')],
        })
      );
    }
  }

  // ==========================================
  // SECTION 2: KHUNG MA TRẬN ĐỀ KIỂM TRA
  // ==========================================
  children.push(new Paragraph({ pageBreakBefore: true, children: [text('')] }));
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        text(
          `KHUNG MA TRẬN ĐỀ KIỂM TRA MÔN ${exam.subject.toUpperCase()} LỚP ${exam.grade}`,
          { bold: true, size: headingSize }
        ),
      ],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        text(
          `Theo Chương trình GDPT 2018 và Thông tư 27/2020/TT-BGDĐT`,
          { italics: true, size: normalSize }
        ),
      ],
    })
  );
  children.push(new Paragraph({ children: [text('')] }));

  // Matrix Table
  const matrixHeaderRow = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('STT', { bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('Mạch kiến thức / Chủ đề', { bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('Mức 1\n(TN/TL)', { bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('Mức 2\n(TN/TL)', { bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('Mức 3\n(TL)', { bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('Tổng số câu', { bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('Tổng điểm', { bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('Tỉ lệ %', { bold: true })] })] }),
    ],
  });

  const matrixRows: TableRow[] = [matrixHeaderRow];
  matrix.rows.forEach((r, idx) => {
    matrixRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(`${idx + 1}`)] })] }),
          new TableCell({ children: [new Paragraph({ children: [text(`${r.strand}: ${r.topic}`)] })] }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [text(`${r.m1_tn.count} TN (${r.m1_tn.points}đ)\n${r.m1_tl.count} TL (${r.m1_tl.points}đ)`)],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [text(`${r.m2_tn.count} TN (${r.m2_tn.points}đ)\n${r.m2_tl.count} TL (${r.m2_tl.points}đ)`)],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [text(`${r.m3_tl.count} TL (${r.m3_tl.points}đ)`)],
              }),
            ],
          }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(`${r.total_count}`)] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(`${formatPoints(r.total_points)}`)] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(`${r.percentage}%`)] })] }),
        ],
      })
    );
  });

  // Total summary row
  matrixRows.push(
    new TableRow({
      children: [
        new TableCell({ columnSpan: 2, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('TỔNG CỘNG', { bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(`${matrix.totalM1Points}đ (${matrix.m1Percentage}%)`, { bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(`${matrix.totalM2Points}đ (${matrix.m2Percentage}%)`, { bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(`${matrix.totalM3Points}đ (${matrix.m3Percentage}%)`, { bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(`${matrix.grandTotalQuestions}`, { bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(`${formatPoints(matrix.grandTotalPoints)}đ`, { bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('100%', { bold: true })] })] }),
      ],
    })
  );

  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: matrixRows }));
  children.push(new Paragraph({ children: [text('')] }));

  // ==========================================
  // SECTION 3: BẢN ĐẶC TẢ CHI TIẾT
  // ==========================================
  children.push(new Paragraph({ pageBreakBefore: true, children: [text('')] }));
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        text(
          `BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ MÔN ${exam.subject.toUpperCase()} LỚP ${exam.grade}`,
          { bold: true, size: headingSize }
        ),
      ],
    })
  );
  children.push(new Paragraph({ children: [text('')] }));

  const specRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('STT', { bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('Mạch kiến thức / Chủ đề', { bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('Mức độ', { bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('Yêu cầu cần đạt chuẩn GDPT 2018', { bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('Dạng câu hỏi', { bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('Câu số', { bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('Điểm', { bold: true })] })] }),
      ],
    }),
  ];

  specs.forEach((s) => {
    specRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(`${s.stt}`)] })] }),
          new TableCell({ children: [new Paragraph({ children: [text(`${s.strand}\n(${s.topic})`)] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(s.level === 'm1' ? 'Mức 1 (Biết)' : s.level === 'm2' ? 'Mức 2 (Hiểu)' : 'Mức 3 (Vận dụng)')] })] }),
          new TableCell({ children: [new Paragraph({ children: [text(s.competency)] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(s.questionFormatLabel)] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(`Câu ${s.questionNumber}`, { bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(`${formatPoints(s.points)}`)] })] }),
        ],
      })
    );
  });

  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: specRows }));
  children.push(new Paragraph({ children: [text('')] }));

  // ==========================================
  // SECTION 4: ĐÁP ÁN & HƯỚNG DẪN CHẤM
  // ==========================================
  children.push(new Paragraph({ pageBreakBefore: true, children: [text('')] }));
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        text(
          `HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM CHI TIẾT`,
          { bold: true, size: headingSize }
        ),
      ],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        text(
          `MÔN: ${exam.subject.toUpperCase()} LỚP ${exam.grade}`,
          { bold: true, size: normalSize }
        ),
      ],
    })
  );
  children.push(new Paragraph({ children: [text('')] }));

  for (const q of exam.questions) {
    children.push(
      new Paragraph({
        children: [
          text(`Câu ${q.order} `, { bold: true }),
          text(`(${formatPoints(q.points)} điểm): `, { italics: true }),
          text(q.answerKey, { bold: true }),
        ],
      })
    );
    children.push(
      new Paragraph({
        indent: { left: 360 },
        children: [text(`- Hướng dẫn chấm: ${q.gradingGuide}`, { italics: true })],
      })
    );
    children.push(new Paragraph({ children: [text('')] }));
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
