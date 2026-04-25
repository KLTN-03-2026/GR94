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
}
