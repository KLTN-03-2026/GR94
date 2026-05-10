import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Budget } from '../budget/schema/budget.schema';
import { Expenses } from '../expenses/schema/expense.schema';
import { Categoris } from '../categoris/schema/categoris.schema';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    @InjectModel(Budget.name) private budgetModel: Model<Budget>,
    @InjectModel(Expenses.name) private expensesModel: Model<Expenses>,
    @InjectModel(Categoris.name) private categoryModel: Model<Categoris>,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
    });
  }

  async getBudgetAdvice(budgetId: string, role: string) {
    const budget = await this.budgetModel
      .findById(budgetId)
      .populate('categoryId')
      .lean();

    if (!budget) {
      throw new NotFoundException('Không tìm thấy ngân sách');
    }

    const category = budget.categoryId as any;
    const { month, year, limitAmount, spaceId } = budget;

    // Lấy tổng chi tiêu thực tế cho category này trong tháng/năm của budget
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = await this.expensesModel
      .find({
        spaceID: spaceId,
        categoryID: category._id,
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    const currentSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = (currentSpent / limitAmount) * 100;

    // Tính toán số ngày còn lại trong tháng
    const today = new Date();
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const remainingDays = Math.max(1, lastDayOfMonth - today.getDate());
    const remainingBudget = Math.max(0, limitAmount - currentSpent);
    const dailyBudget = remainingBudget / remainingDays;

    const recentTransactionsStr = expenses
      .map(
        (e) =>
          `- ${new Date(e.date).toLocaleDateString('vi-VN')}: ${e.amount.toLocaleString('vi-VN')}đ (${e.description || 'Không có mô tả'})`,
      )
      .join('\n');

    const prompt = `
Bạn là một chuyên gia tư vấn tài chính cá nhân cho ứng dụng "GiaKế". 
Hãy đưa ra lời khuyên chi tiêu ngắn gọn, súc tích và hữu ích dựa trên dữ liệu sau:

- Vai trò người dùng: ${role === 'parent' ? 'Chủ hộ (Cần cái nhìn tổng quan, tối ưu hóa)' : 'Thành viên (Cần nhắc nhở chi tiêu, tiết kiệm)'}
- Danh mục: ${category.name}
- Hạn mức ngân sách: ${limitAmount.toLocaleString('vi-VN')}đ
- Đã chi tiêu: ${currentSpent.toLocaleString('vi-VN')}đ (${percentage.toFixed(2)}%)
- Tháng/Năm: ${month}/${year}
- Số ngày còn lại trong tháng: ${remainingDays} ngày
- Ngân sách còn lại: ${remainingBudget.toLocaleString('vi-VN')}đ

Các giao dịch gần đây trong danh mục này:
${recentTransactionsStr || 'Chưa có giao dịch nào.'}

Yêu cầu:
1. Phân tích tình hình chi tiêu hiện tại (Có đang vượt mức không? Tốc độ chi tiêu thế nào?).
2. **QUAN TRỌNG:** Dựa trên ngân sách còn lại (${remainingBudget.toLocaleString('vi-VN')}đ) và ${remainingDays} ngày còn lại, hãy tính toán và đưa ra con số cụ thể: "Mỗi ngày bạn nên tiêu tối đa bao nhiêu?" cho danh mục này.
3. Đưa ra 2-3 lời khuyên cụ thể để tối ưu hóa chi tiêu.
4. Trả về kết quả bằng tiếng Việt, định dạng Markdown (sử dụng bullet points, font bold cho các ý chính).
5. KHÔNG trả về các câu chào hỏi rườm rà.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return {
        advice: response.text(),
        data: {
          limitAmount,
          currentSpent,
          percentage,
        },
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        advice:
          'Rất tiếc, AI đang bận một chút và không thể đưa ra lời khuyên ngay lúc này. Bạn hãy thử lại sau nhé!',
        error: error.message,
      };
    }
  }
  async processVoiceText(text: string) {
    const prompt = `
Bạn là một trợ lý tài chính cá nhân. Hãy phân tích đoạn văn bản sau và trích xuất thông tin giao dịch tài chính dưới dạng JSON.
Văn bản cần phân tích: "${text}"

Yêu cầu trả về kết quả là một đối tượng JSON duy nhất với các trường sau:
{
  "amount": number, // Số tiền trích xuất được (ví dụ: 50000). Nếu không có số tiền, trả về 0.
  "type": "income" | "expense", // "income" nếu là khoản thu (lương, thưởng...), "expense" nếu là khoản chi (mua sắm, ăn uống...). Mặc định là "expense".
  "category": string, // Gợi ý tên danh mục phù hợp (ví dụ: Ăn uống, Di chuyển, Mua sắm, Lương...).
  "description": string // Mô tả chi tiết về khoản thu chi này.
}

Chỉ trả về JSON, không thêm bất kỳ văn bản nào khác.
`;

    try {
      const result = await this.model.generateContent({
        contents: prompt,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  async processVoiceAudio(
    audioBase64: string,
    mimeType: string,
    categories: string[] = [],
  ) {
    const categoriesStr =
      categories.length > 0
        ? `BẮT BUỘC phải chọn 1 trong các danh mục sau nếu khớp: [${categories.join(', ')}]. Nếu không khớp cái nào, hãy dùng từ ngữ mô tả ngắn gọn.`
        : 'Gợi ý tên danh mục phù hợp (ví dụ: Ăn uống, Di chuyển, Mua sắm, Lương, Giải trí...).';

    const prompt = `
Bạn là một trợ lý tài chính cá nhân. Hãy nghe đoạn audio này (tiếng Việt) và trích xuất thông tin giao dịch tài chính.

**QUY TRÌNH THỰC HIỆN (BẮT BUỘC):**
1. Lắng nghe cẩn thận và GHI LẠI nguyên văn (transcription) những gì người dùng nói trong audio.
2. Từ văn bản đã ghi lại, trích xuất thông tin và trả về một đối tượng JSON.

**HƯỚNG DẪN XỬ LÝ TẠP ÂM:**
- Hãy tập trung vào giọng nói chính, có âm lượng lớn nhất ở gần micro.
- Bỏ qua các tiếng ồn nền như tiếng còi xe, tiếng nhạc, tiếng tivi hoặc tiếng người khác nói nhỏ ở phía xa.

**HƯỚNG DẪN TRÍCH XUẤT NGÀY THÁNG:**
- Nhận diện ngày tháng được nhắc đến (ví dụ: "hôm qua", "hôm nay", "ngày 5", "tháng trước").
- Quy đổi ngày đó về định dạng YYYY-MM-DD.
- Nếu người dùng KHÔNG nhắc đến ngày tháng, hãy mặc định trả về ngày hôm nay: "${new Date().toISOString().slice(0, 10)}".

Yêu cầu trả về kết quả là một đối tượng JSON duy nhất theo cấu trúc sau:
{
  "transcription": string, // Nguyên văn những gì người dùng nói (ví dụ: "hôm qua đi ăn phở hết 50 nghìn")
  "data": {
    "amount": number, // Số tiền trích xuất được (ví dụ: 50000). Nếu không có số tiền, trả về 0.
    "type": "income" | "expense", // "income" hoặc "expense". Mặc định là "expense".
    "category": string, // ${categoriesStr}
    "description": string, // Mô tả chi tiết về khoản thu chi này.
    "date": string // Ngày giao dịch định dạng YYYY-MM-DD.
  }
}

Chỉ trả về JSON theo đúng cấu trúc trên, không thêm bất kỳ văn bản nào khác ngoài JSON.
`;

    try {
      const result = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType || 'audio/webm',
                  data: audioBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });
      const response = await result.response;
      let text = response.text();
      // Fallback: strip markdown fences if present
      text = text
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      console.log('[AI] Voice audio response text:', text);
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini Audio API Error:', error);
      throw error;
    }
  }
}
