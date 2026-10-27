import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsers with support for base64 screenshots
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Helper interface for analysis response
interface SocraticResponsePayload {
  errorLocation: string;
  errorType: string;
  conceptExplanation: string;
  socraticQuestion: string;
  highlightedLine?: number | null;
  detectedCodeSnippet?: string;
  fullMessageMarkdown: string;
}

// Built-in Pedagogical Socratic Engine for Grade 10 Python
// Ensures 100% reliability even if GEMINI_API_KEY is not yet attached or network scope is limited
function analyzeLocally(
  code: string = '',
  errorText: string = '',
  studentMessage: string = '',
  conversationHistory: any[] = []
): SocraticResponsePayload {
  // If student is continuing the conversation
  if (studentMessage && conversationHistory.length > 0) {
    const lower = studentMessage.toLowerCase();
    let reply = '';

    if (lower.includes(':') || lower.includes('hai chấm') || lower.includes('dấu hai chấm')) {
      reply = `🎉 Rất xuất sắc! Em đã quan sát rất tinh tế. Đúng là trong Python, sau tiêu đề các câu lệnh cấu trúc (như for, if, while) bắt buộc phải có dấu hai chấm ':'.

Bây giờ, em hãy mở Thonny IDE, bổ sung dấu hai chấm vào cuối dòng lệnh đó rồi nhấn phím F5 (Run) để kiểm tra xem chương trình chạy trơn tru chưa nhé! Thầy tin em sẽ tự mình vượt qua bài này.`;
    } else if (lower.includes('thụt') || lower.includes('lùi') || lower.includes('indent') || lower.includes('cách')) {
      reply = `👏 Chuẩn xác rồi em! Python dùng thụt lề để xác định các câu lệnh con bên trong khối lệnh. 

Em hãy kiểm tra lại xem dòng lệnh đó đã được lùi vào 4 khoảng trắng (hoặc 1 phím Tab) so với câu lệnh cha phía trên chưa, sau đó nhấn F5 trong Thonny để kiểm tra kết quả nhé!`;
    } else if (lower.includes('int') || lower.includes('kiểu') || lower.includes('str') || lower.includes('chuỗi') || lower.includes('xâu') || lower.includes('ép')) {
      reply = `💡 Rất chính xác! Hàm input() trong Python luôn trả về một xâu ký tự (str). Nếu muốn tính toán số học, ta bắt buộc phải ép kiểu bằng hàm int() hoặc float().

Em hãy thử áp dụng hàm ép kiểu cho biến vừa nhập rồi bấm Run (F5) trong Thonny xem kết quả nhé!`;
    } else if (lower.includes('==') || lower.includes('so sánh') || lower.includes('hai dấu bằng')) {
      reply = `🎯 Em suy luận rất chuẩn! Một dấu '=' là lệnh gán giá trị, còn để so sánh bằng trong mệnh đề điều kiện if thì bắt buộc phải dùng hai dấu bằng '=='.

Em hãy vào sửa lại hai dấu '==' rồi chạy thử chương trình trong Thonny xem điều kiện đã hoạt động chính xác chưa nhé!`;
    } else if (lower.includes('hoa') || lower.includes('thường') || lower.includes('chưa có') || lower.includes('chưa gán')) {
      reply = `👍 Đúng rồi em! Python phân biệt rất rạch ròi giữa chữ hoa và chữ thường. Nếu tên biến lúc gán và lúc gọi khác nhau một chữ cái viết hoa/thường, Python sẽ coi đó là biến hoàn toàn mới chưa được định nghĩa.

Em hãy kiểm tra và chỉnh cho tên biến ở các dòng khớp từng chữ cái nhé!`;
    } else {
      reply = `Thầy ghi nhận suy nghĩ của em: "${studentMessage}".

Để tự tìm ra cách sửa, em hãy quan sát kỹ lại thông báo lỗi và dòng lệnh mà Cố vấn đã chỉ điểm ở trên. Em có nhận thấy sự khác biệt nào giữa câu lệnh của em so với cú pháp chuẩn được học trong SGK Tin học 10 không? Hãy thử suy nghĩ thêm một chút hoặc thử chỉnh sửa trực tiếp trên Thonny rồi bấm F5 xem sao nhé!`;
    }

    return {
      errorLocation: 'Đang đối thoại gỡ lỗi',
      errorType: 'Trao đổi Socratic',
      conceptExplanation: 'Tư duy phản biện và tự kiểm chứng trong lập trình.',
      socraticQuestion: 'Em đã thử sửa và chạy lại trên Thonny chưa, kết quả thế nào?',
      fullMessageMarkdown: reply,
      highlightedLine: null,
      detectedCodeSnippet: code,
    };
  }

  // Initial Analysis
  const lines = code ? code.split('\n') : [];
  let foundLine: number | null = null;
  let errorType = 'Lỗi lập trình Python';
  let errorLocation = 'Chưa xác định';
  let conceptExplanation = '';
  let socraticQuestion = '';

  // Extract from errorText traceback if provided
  const lineMatch = errorText.match(/line\s+([0-9]+)/i);
  if (lineMatch) {
    foundLine = parseInt(lineMatch[1], 10);
    errorLocation = `Dòng ${foundLine}`;
  }

  const typeMatch = errorText.match(/([A-Z][a-zA-Z]+Error):/);
  if (typeMatch) {
    errorType = typeMatch[1];
  }

  // 1. Check missing colon
  let missingColonLine: number | null = null;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (
      (trimmed.startsWith('for ') ||
        trimmed.startsWith('if ') ||
        trimmed.startsWith('elif ') ||
        trimmed.startsWith('while ') ||
        trimmed.startsWith('def ') ||
        (trimmed.startsWith('else') && !trimmed.startsWith('else:'))) &&
      !trimmed.endsWith(':') &&
      !trimmed.includes('#')
    ) {
      missingColonLine = i + 1;
      break;
    }
  }

  // 2. Check assignment in if
  let assignInIfLine: number | null = null;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (
      trimmed.startsWith('if ') &&
      !trimmed.includes('==') &&
      !trimmed.includes('!=') &&
      !trimmed.includes('<=') &&
      !trimmed.includes('>=') &&
      trimmed.includes('=') &&
      !trimmed.includes(' in ')
    ) {
      assignInIfLine = i + 1;
      break;
    }
  }

  // 3. Check indentation
  let indentLine: number | null = null;
  for (let i = 0; i < lines.length - 1; i++) {
    const current = lines[i].trim();
    const next = lines[i + 1];
    if (
      (current.startsWith('if ') ||
        current.startsWith('for ') ||
        current.startsWith('while ') ||
        current.startsWith('else:') ||
        current.startsWith('def ')) &&
      current.endsWith(':')
    ) {
      if (next && next.trim() && !next.startsWith(' ') && !next.startsWith('\t')) {
        indentLine = i + 2;
        break;
      }
    }
  }

  // Determine specific error scenario
  if (errorType === 'IndentationError' || indentLine) {
    foundLine = indentLine || foundLine || 4;
    errorType = 'IndentationError (Lỗi thụt lề khối lệnh)';
    errorLocation = `Dòng ${foundLine}`;
    conceptExplanation =
      'Trong Python (Bài 19, 20 SGK Tin học 10), các câu lệnh thuộc cùng một khối lệnh con bên trong if, else, for, while, def bắt buộc phải được lùi đầu dòng (thụt lề) đều đặn, thông thường là 4 khoảng trắng hoặc 1 phím Tab. Python không dùng ngoặc nhọn { } như các ngôn ngữ khác mà dùng chính khoảng thụt lề để phân cấp câu lệnh.';
    socraticQuestion =
      'Dòng lệnh này trực thuộc khối lệnh nào phía trên, và em cần lùi đầu dòng vào bao nhiêu khoảng cách để Python nhận diện nó là lệnh con?';
  } else if (assignInIfLine) {
    foundLine = assignInIfLine;
    errorType = 'SyntaxError (Dùng nhầm phép gán trong điều kiện)';
    errorLocation = `Dòng ${foundLine}`;
    conceptExplanation =
      'Trong môn Tin học 10, một dấu bằng đơn "=" đại diện cho câu lệnh gán giá trị cho biến. Trong khi đó, để so sánh bằng trong biểu thức điều kiện của câu lệnh rẽ nhánh if, Python quy ước bắt buộc phải sử dụng toán tử hai dấu bằng "==".';
    socraticQuestion =
      'Trong câu lệnh điều kiện if, mục đích của em là gán giá trị hay so sánh giá trị giữa hai vế, và phép so sánh bằng trong Python được biểu diễn bằng ký hiệu gì?';
  } else if (errorType === 'TypeError' || errorText.includes('concatenate str') || (code.includes('input(') && !code.includes('int(input(') && !code.includes('float(input(') && (code.includes(' + ') || code.includes(' - ')))) {
    foundLine = foundLine || 4;
    errorType = 'TypeError (Không tương thích kiểu dữ liệu)';
    errorLocation = `Dòng ${foundLine}`;
    conceptExplanation =
      'Theo Bài 18 SGK Tin học 10, hàm input() luôn đọc dữ liệu nhập vào từ bàn phím dưới dạng xâu ký tự (kiểu str). Khi em thực hiện các phép toán số học như cộng (+) hoặc trừ (-) giữa một xâu ký tự với một số nguyên, Python sẽ báo lỗi TypeError vì hai kiểu dữ liệu này không thể trực tiếp tính toán cùng nhau.';
    socraticQuestion =
      'Dữ liệu người dùng nhập vào thông qua hàm input() có kiểu dữ liệu gì, và em cần sử dụng hàm chuyển đổi kiểu nào để biến nó thành số nguyên tính toán được?';
  } else if (missingColonLine) {
    foundLine = missingColonLine;
    errorType = 'SyntaxError (Thiếu dấu hai chấm ":")';
    errorLocation = `Dòng ${foundLine}`;
    conceptExplanation =
      'Trong cú pháp Python (Bài 19, 20 SGK Tin học 10), câu lệnh cấu trúc như câu lệnh lặp for, câu lệnh rẽ nhánh if, elif, else, while bắt buộc phải kết thúc dòng tiêu đề bằng một dấu hai chấm ":". Dấu hai chấm này đóng vai trò mở đầu cho khối lệnh con tiếp theo.';
    socraticQuestion =
      'Quan sát kỹ ký tự cuối cùng của dòng lệnh điều khiển này, em thấy còn thiếu dấu câu đặc trưng nào của ngôn ngữ Python?';
  } else if (errorType === 'NameError' || errorText.includes('is not defined')) {
    foundLine = foundLine || 5;
    errorType = 'NameError (Tên biến chưa được định nghĩa)';
    errorLocation = `Dòng ${foundLine}`;
    conceptExplanation =
      'Theo Bài 17 SGK Tin học 10, một biến chỉ có thể được sử dụng trong biểu thức sau khi nó đã được gán giá trị trước đó. Ngoài ra, Python phân biệt chữ hoa và chữ thường (ví dụ: Tong và tong là hai biến hoàn toàn khác nhau). Nếu viết sai một chữ cái hoặc gọi biến khi chưa khởi tạo, Python sẽ báo lỗi NameError.';
    socraticQuestion =
      'Tên biến này đã được gán giá trị ở các dòng lệnh phía trước chưa, và các chữ cái viết hoa hoặc viết thường có trùng khớp 100% với tên biến đã tạo không?';
  } else if (errorType === 'IndexError' || errorText.includes('list index out of range')) {
    foundLine = foundLine || 5;
    errorType = 'IndexError (Chỉ số danh sách vượt quá phạm vi)';
    errorLocation = `Dòng ${foundLine}`;
    conceptExplanation =
      'Theo Bài 22 SGK Tin học 10, chỉ số của các phần tử trong danh sách (List) của Python bắt đầu từ số 0 và phần tử cuối cùng có chỉ số là len(list) - 1. Nếu một danh sách có n phần tử, truy cập phần tử thứ n sẽ bị vượt quá phạm vi cho phép và gây ra lỗi IndexError.';
    socraticQuestion =
      'Trong Python, phần tử đầu tiên của danh sách có chỉ số là bao nhiêu, và nếu danh sách có n phần tử thì chỉ số hợp lệ lớn nhất là bao nhiêu?';
  } else {
    foundLine = foundLine || 3;
    errorType = errorType || 'SyntaxError (Lỗi cú pháp Python)';
    errorLocation = `Dòng ${foundLine}`;
    conceptExplanation =
      'Trong lập trình Python lớp 10, lỗi cú pháp hoặc lỗi thực thi xảy ra khi câu lệnh chưa tuân thủ đúng quy tắc ngữ pháp của Python (như cặp ngoặc, dấu câu, thụt lề hoặc kiểu dữ liệu). Nhận diện đúng dòng thông báo lỗi là bước đầu tiên để làm chủ chương trình.';
    socraticQuestion =
      'Quan sát kỹ dòng lệnh được chỉ ra, em hãy đối chiếu từng ký tự với cú pháp mẫu trong SGK Tin học 10 để tìm ra điểm khác biệt?';
  }

  const markdown = `### 1. 📍 Xác định lỗi:
- **Vị trí lỗi:** ${errorLocation}
- **Loại lỗi:** ${errorType}

### 2. 💡 Giải thích khái niệm Tin học 10:
${conceptExplanation}

### 3. ❓ Câu hỏi gợi mở:
"${socraticQuestion}"`;

  return {
    errorLocation,
    errorType,
    conceptExplanation,
    socraticQuestion,
    highlightedLine: foundLine,
    detectedCodeSnippet: code,
    fullMessageMarkdown: markdown,
  };
}

// API: Analyze error / Socratic interaction
app.post('/api/socratic/analyze', async (req, res) => {
  const {
    code = '',
    errorText = '',
    imageBase64,
    imageMimeType,
    conversationHistory = [],
    studentMessage = '',
  } = req.body;

  if (!code && !errorText && !imageBase64 && !studentMessage) {
    return res.status(400).json({
      error: 'Vui lòng cung cấp mã code, thông báo lỗi hoặc ảnh chụp Thonny/IDLE.',
    });
  }

  // If GEMINI_API_KEY is available, try Gemini API first
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const parts: any[] = [];

      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: imageMimeType || 'image/png',
            data: cleanBase64,
          },
        });
        parts.push({
          text: 'Dưới đây là ảnh chụp màn hình lập trình Python trên Thonny hoặc IDLE do học sinh gửi. Hãy quan sát thật kỹ mã nguồn, số dòng, thông báo lỗi trong tab Shell / Assistant hoặc cửa sổ thông báo.',
        });
      }

      let promptContext = '';
      if (code) {
        promptContext += `\n[MÃ NGUỒN PYTHON CỦA HỌC SINH]:\n\`\`\`python\n${code}\n\`\`\`\n`;
      }
      if (errorText) {
        promptContext += `\n[THÔNG BÁO LỖI / TRACEBACK TỪ SHELL]:\n\`\`\`\n${errorText}\n\`\`\`\n`;
      }
      if (studentMessage) {
        promptContext += `\n[LỜI NHẮN / TRẢ LỜI CỦA HỌC SINH]:\n${studentMessage}\n`;
      }

      const isNewAnalysis = !conversationHistory || conversationHistory.length === 0;

      const requestPrompt = isNewAnalysis
        ? `${promptContext}
Hãy thực hiện đúng nhiệm vụ Cố vấn Lập trình Tin học 10 Socratic theo 3 bước:
1. Xác định lỗi (chỉ rõ dòng và loại lỗi)
2. Giải thích khái niệm Tin học 10 liên quan
3. Đúng 1 câu hỏi gợi mở để học sinh tự sửa (TUYỆT ĐỐI KHÔNG CUNG CẤP CODE SỬA HOÀN CHỈNH).

Đồng thời, hãy cung cấp thêm một khối JSON ở CUỐI CÙNG dạng:
\`\`\`json
{
  "errorLocation": "Dòng X...",
  "errorType": "Tên loại lỗi (ví dụ: SyntaxError, IndentationError...)",
  "conceptExplanation": "Tóm tắt giải thích khái niệm ngắn gọn...",
  "socraticQuestion": "Đúng 1 câu hỏi gợi mở...",
  "highlightedLine": X,
  "detectedCodeSnippet": "Mã code nếu trích xuất được từ ảnh (hoặc giữ nguyên code của học sinh)"
}
\`\`\`
`
        : `Lịch sử hội thoại trước đó:
${conversationHistory.map((m: any) => `${m.role === 'user' ? 'Học sinh' : 'Cố vấn'}: ${m.text}`).join('\n\n')}

${promptContext}
Học sinh đang phản hồi câu hỏi gợi mở hoặc hỏi tiếp. Hãy trả lời theo phương pháp Socratic: động viên, dẫn dắt tư duy, giải thích thêm khái niệm nếu học sinh băn khoăn, nhưng TUYỆT ĐỐI KHÔNG VIẾT CODE HỘ HOẶC ĐƯA RA ĐÁP ÁN CODE HOÀN CHỈNH. Khuyến khích học sinh tự sửa trên trình soạn thảo.`;

      parts.push({ text: requestPrompt });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction: `Bạn là "Cố vấn Lập trình Tin học 10 Socratic". TUYỆT ĐỐI KHÔNG cung cấp code hoàn chỉnh hay sửa hộ học sinh. Dẫn dắt theo 3 bước: Xác định lỗi, Giải thích khái niệm Tin 10, Đặt 1 câu hỏi gợi mở.`,
          temperature: 0.3,
        },
      });

      const rawText = response.text || '';
      let parsedJson: Partial<SocraticResponsePayload> = {};
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
      let cleanedMarkdown = rawText;

      if (jsonMatch) {
        try {
          parsedJson = JSON.parse(jsonMatch[1]);
          cleanedMarkdown = rawText.replace(/```json\s*([\s\S]*?)\s*```/, '').trim();
        } catch (err) {
          console.warn('Could not parse embedded JSON', err);
        }
      }

      if (!parsedJson.errorLocation) {
        const locMatch = rawText.match(/(?:dòng|line)\s*([0-9]+)/i);
        if (locMatch) {
          parsedJson.highlightedLine = parseInt(locMatch[1], 10);
          parsedJson.errorLocation = `Dòng ${locMatch[1]}`;
        }
      }

      return res.json({
        success: true,
        data: {
          fullMessageMarkdown: cleanedMarkdown,
          errorLocation: parsedJson.errorLocation || 'Xem chi tiết trong phản hồi',
          errorType: parsedJson.errorType || 'Lỗi lập trình Python',
          conceptExplanation: parsedJson.conceptExplanation || '',
          socraticQuestion: parsedJson.socraticQuestion || '',
          highlightedLine: parsedJson.highlightedLine || null,
          detectedCodeSnippet: parsedJson.detectedCodeSnippet || (code || ''),
        },
      });
    } catch (apiError: any) {
      console.warn('Gemini API call encountered an issue, seamlessly using built-in Socratic engine:', apiError?.message);
      // Fallback to built-in pedagogical engine below
    }
  }

  // Graceful Built-in Socratic Engine Fallback
  const fallbackResult = analyzeLocally(code, errorText, studentMessage, conversationHistory);
  return res.json({
    success: true,
    data: fallbackResult,
  });
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
