import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const port = process.env.PORT || 3000;

// Gemini AI client initialization
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Chưa cấu hình GEMINI_API_KEY trong môi trường.');
  }
  return new GoogleGenAI({ apiKey });
};

// API: Generate complete exam package with Matrix, Specification, Questions, and Rubric
app.post('/api/ai/generate-exam', async (req, res) => {
  try {
    const { subject, grade, bookSeries, period, customPrompt, readingGenre } = req.body;
    const ai = getAiClient();

    const systemInstruction = `Bạn là Chuyên gia Khảo thí và Giáo viên Tiểu học cốt cán nhiều năm kinh nghiệm, am hiểu sâu sắc Chương trình GDPT 2018, Thông tư 27/2020/TT-BGDĐT và quy định xây dựng Ma trận, Bản đặc tả, Đề kiểm tra và Hướng dẫn chấm của Bộ GD&ĐT Việt Nam.

QUY TẮC CỐT LÕI BẮT BUỘC TUÂN THỦ 100%:
1. Cấu trúc đề:
- Đánh số liên tục từ Câu 1 đến câu cuối cùng.
- TUYỆT ĐỐI KHÔNG GHI tiêu đề "Phần trắc nghiệm", "Phần tự luận" trong đề kiểm tra.
- Sắp xếp thứ tự: Trắc nghiệm trước -> Tự luận sau.
- Thứ tự Trắc nghiệm:
  + Mức 1: Biết nhiều lựa chọn (NLC) -> Biết đúng sai (ĐS) -> Biết nối cột (NC) -> Biết điền khuyết (ĐK)
  + Mức 2: Hiểu nhiều lựa chọn (NLC) -> Hiểu đúng sai (ĐS) -> Hiểu nối cột (NC) -> Hiểu điền khuyết (ĐK)
- Thứ tự Tự luận:
  + Lần lượt: Mức 1 (Biết) -> Mức 2 (Hiểu) -> Mức 3 (Vận dụng)
- TUYỆT ĐỐI KHÔNG TẠO CÂU TRẮC NGHIỆM Ở MỨC VẬN DỤNG (Mức 3 chỉ dành cho Tự luận).
- Không ghép câu thuộc 2 chủ đề/bài học/mạch kiến thức với nhau.
- Mỗi câu hỏi tương ứng với đúng MỘT bản đặc tả.

2. Quy tắc điểm & trình bày:
- Câu số (chữ đậm), điểm (chữ nghiêng, không đậm) liền câu số, câu hỏi (chữ không đậm).
  Ví dụ: Câu 1(0,5 điểm): Số gồm 5 trăm nghìn, 3 chục nghìn...
- Câu số và các ý (a, b, c, d) bằng lề, không thụt.
- Các phương án (A, B, C, D) lùi vào 1 tab (1cm). Có đủ 4 phương án A, B, C, D cho câu NLC lớp 4.
- Điểm trắc nghiệm:
  + TN nhiều lựa chọn: 0,5 điểm/câu
  + TN đúng sai, nối cột, điền khuyết: 0,25 điểm/ý
- Điểm tự luận:
  + Mức 1: 0,5 điểm/câu
  + Mức 2: 1,0 điểm/câu
  + Mức 3: từ 1,0 đến 2,0 điểm/câu

3. MÔN TOÁN (Bộ sách Kết nối tri thức - Lớp 4):
- Tỉ lệ mức: 50% M1 - 30% M2 - 20% M3.
- Tỉ lệ hình thức: TN 60% (6đ) - TL 40% (4đ). Tổng 10 điểm.
- Mạch kiến thức lớp 4 theo từng kì:
  + GKI: Số và phép tính = 70% (7đ); Hình học và đo lường = 30% (3đ).
  + CKI: Số và phép tính = 50% (5đ); Hình học và đo lường = 50% (5đ).
  + GKII: Số và phép tính = 70% (7đ); Hình học và đo lường = 30% (3đ).
  + CN: Số và phép tính = 70% (7đ); Hình học và đo lường = 20% (2đ); Thống kê và xác suất = 10% (1đ).

4. MÔN TIẾNG VIỆT (Bộ sách Kết nối tri thức - Lớp 4):
- Đọc thành tiếng = 3đ; Đọc hiểu = 7đ (văn bản ngoài SGK).
- Viết đoạn/bài văn = 10đ.
- Phần Đọc hiểu gồm đúng 11 câu = 7 điểm:
  + Đọc hiểu văn bản: 4đ (TN 4 câu = 2đ; Tự luận 2 câu = 2đ).
  + Kiến thức tiếng Việt: 3đ (TN 4 câu = 2đ; Tự luận 1 câu = 1đ).
  + Mức độ: M1 (~4đ) - M2 (~2đ) - M3 (~1đ).
- Chuẩn số chữ văn bản đọc ngoài SGK Lớp 4:
  + Truyện, kịch bản: 280 - 330 chữ.
  + Bài miêu tả: 200 - 250 chữ.
  + Thơ: 100 - 120 chữ.
  + Văn bản thông tin: 150 - 180 chữ.

5. MÔN LỊCH SỬ & ĐỊA LÝ (Bộ sách Kết nối tri thức - Lớp 4):
- Mức 1 - 3: 50% - 30% - 20%.
- Tỷ lệ: TN 60% (6đ) - TL 40% (4đ).

Hãy trả về kết quả thuần JSON (không bọc trong \`\`\`json markdown hoặc giải thích bên ngoài) theo đúng schema:
{
  "title": string,
  "school": string,
  "district": string,
  "subject": string,
  "grade": number,
  "bookSeries": string,
  "period": "GKI" | "CKI" | "GKII" | "CN",
  "duration": number,
  "readingPassage": {
    "title": string,
    "author": string,
    "genre": "story" | "description" | "poem" | "info",
    "text": string,
    "wordCount": number
  } (nếu là môn Tiếng Việt),
  "writingSection": {
    "prompt": string,
    "points": number,
    "gradingRubric": string
  } (nếu có môn Tiếng Việt),
  "questions": [
    {
      "id": string,
      "order": number,
      "type": "mcq" | "true_false" | "matching" | "fill_blank" | "essay",
      "level": "m1" | "m2" | "m3",
      "strand": string,
      "topic": string,
      "competency": string,
      "points": number,
      "content": string,
      "options": [{"label": "A", "text": string}, {"label": "B", "text": string}, {"label": "C", "text": string}, {"label": "D", "text": string}],
      "subQuestions": string[],
      "matchingPairs": [{"left": string, "right": string}],
      "answerKey": string,
      "gradingGuide": string
    }
  ]
}`;

    const promptText = `Hãy tạo một bộ đề kiểm tra hoàn chỉnh chuẩn GDPT 2018 bao gồm Ma trận, Đặc tả, Đề thi và Hướng dẫn chấm cho:
- Môn học: ${subject || 'Toán'}
- Khối lớp: ${grade || 4}
- Bộ sách: ${bookSeries || 'Kết nối tri thức với cuộc sống'}
- Kì kiểm tra: ${period || 'GKI'}
${readingGenre ? `- Thể loại bài đọc (đối với Tiếng Việt): ${readingGenre}` : ''}
${customPrompt ? `- Yêu cầu bổ sung của giáo viên: ${customPrompt}` : ''}

LƯU Ý QUAN TRỌNG:
1. Đảm bảo đúng tổng điểm, đúng số câu, chuẩn từng mức độ M1, M2, M3.
2. Xếp thứ tự câu TUÂN THỦ NGHIÊM NGẶT: TN M1 (NLC -> ĐS -> NC -> ĐK) -> TN M2 (NLC -> ĐS -> NC -> ĐK) -> Tự luận M1 -> Tự luận M2 -> Tự luận M3.
3. Không tạo trắc nghiệm Mức 3.
4. Đảm bảo câu hỏi hay, giàu tính thực tiễn tiểu học, văn phong chuẩn mực sư phạm.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const examData = JSON.parse(responseText);
    res.json({ success: true, data: examData });
  } catch (error: any) {
    console.error('Error generating exam:', error);
    res.status(500).json({ success: false, error: error.message || 'Lỗi khi tạo đề kiểm tra bằng AI.' });
  }
});

// API: Generate Reading Passage for Vietnamese Language with strict word count
app.post('/api/ai/generate-passage', async (req, res) => {
  try {
    const { genre, topic, targetWords } = req.body;
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Hãy sáng tác hoặc cung cấp một bài đọc ngoài SGK cho học sinh Lớp 4 theo chương trình GDPT 2018.
- Thể loại: ${genre || 'truyện, kịch bản'}
- Chủ đề: ${topic || 'Tình cảm gia đình, quê hương đất nước, bảo vệ môi trường, lòng dũng cảm'}
- Quy định độ dài BẮT BUỘC:
  + Truyện/kịch bản: 280 - 330 chữ
  + Bài miêu tả: 200 - 250 chữ
  + Thơ: 100 - 120 chữ
  + Văn bản thông tin: 150 - 180 chữ
Mục tiêu độ dài: khoảng ${targetWords || 300} chữ.
Nội dung có tính giáo dục cao, trong sáng, phù hợp lứa tuổi học sinh tiểu học.
Trả về JSON format:
{
  "title": string,
  "author": string,
  "genre": string,
  "text": string,
  "wordCount": number,
  "mainIdea": string
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    res.json({ success: true, data: JSON.parse(responseText) });
  } catch (error: any) {
    console.error('Error generating passage:', error);
    res.status(500).json({ success: false, error: error.message || 'Lỗi khi tạo ngữ liệu đọc.' });
  }
});

// API: Audit exam against GDPT 2018 regulations
app.post('/api/ai/audit-exam', async (req, res) => {
  try {
    const { examData } = req.body;
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Bạn là Chuyên viên Thanh tra Khảo thí Phòng/Sở Giáo dục và Đào tạo. Hãy thẩm định chi tiết đề kiểm tra sau xem có tuân thủ 100% Thông tư 27 và GDPT 2018 không:
${JSON.stringify(examData, null, 2)}

Tiêu chí thẩm định:
1. Thứ tự câu: Có liên tục không? Có ghi chữ "Trắc nghiệm" / "Tự luận" không (Quy định: CẤM GHI)?
2. Thứ tự sắp xếp câu: Có đúng thứ tự TN M1 -> TN M2 -> TL M1 -> TL M2 -> TL M3 không?
3. Có câu trắc nghiệm ở Mức 3 không (CẤM)?
4. Thang điểm: TN NLC 0.5đ, TN ĐS/NC/ĐK 0.25đ/ý, TL M1 0.5đ, TL M2 1đ, TL M3 1-2đ?
5. Tỉ lệ Mức 1-2-3 (Toán/Sử Địa: 50-30-20%; TV Đọc hiểu: 40-20-10%)?
6. Tỉ lệ TN/TL (60/40)?
7. Đối với Tiếng Việt: Đọc hiểu có đủ 11 câu không (7 điểm)? Số chữ bài đọc có đúng giới hạn không?

Trả về JSON:
{
  "isValid": boolean,
  "overallScore": number (thang 100),
  "summary": string,
  "passedCriteria": string[],
  "violations": string[],
  "recommendations": string[]
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    res.json({ success: true, data: JSON.parse(responseText) });
  } catch (error: any) {
    console.error('Error auditing exam:', error);
    res.status(500).json({ success: false, error: error.message || 'Lỗi khi thẩm định đề thi.' });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
