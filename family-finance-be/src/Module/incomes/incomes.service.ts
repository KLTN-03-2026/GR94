import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Incomes } from './schema/income.schema';
import { Model, Types } from 'mongoose';
import { GetIncomeDto } from '@/Module/incomes/dto/get-incomes.dto';

@Injectable()
export class IncomesService {
  constructor(
    @InjectModel(Incomes.name)
    private readonly incomesModel: Model<Incomes>,
  ) {}

  // POST/incomes
  async createIncomes(dto: CreateIncomeDto, userID: string, spaceID: string) {
    const income = await this.incomesModel.create({
      spaceID: new Types.ObjectId(spaceID),
      userID: new Types.ObjectId(userID),
      categoryID: new Types.ObjectId(dto.categoryID),
      amount: dto.amount,
      date: dto.date,
      description: dto.description,
      tags: dto.tags?.map((t) => new Types.ObjectId(t)) || [],
    });
    return income.populate([
      { path: 'categoryID', select: 'name icon color' },
      { path: 'userID', select: 'name avatar' },
      { path: 'tags', select: 'name color' },
    ]);
  }

  // GET/incomes
  async getIncomes(
    dto: GetIncomeDto,
    userID: string,
    spaceID: string,
    role: string,
  ) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter: any = { spaceID: new Types.ObjectId(spaceID) };

    if (role === 'member') {
      filter.userID = new Types.ObjectId(userID);
    } else if (dto.userId) {
      filter.userID = new Types.ObjectId(dto.userId);
    }

    if (dto.month || dto.year) {
      const now = new Date();
      const year = dto.year ?? now.getFullYear();
      const month = dto.month ?? now.getMonth() + 1;
      filter.date = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 0, 23, 59, 59),
      };
    }
    if (dto.categoryId) {
      filter.categoryID = new Types.ObjectId(dto.categoryId);
    }
    if (dto.tagId) {
      filter.tags = new Types.ObjectId(dto.tagId);
    }

    const [result, total, summary] = await Promise.all([
      this.incomesModel
        .find(filter)
        .populate('categoryID', 'name icon color')
        .populate('userID', 'name avatar')
        .populate('tags', 'name color')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.incomesModel.countDocuments(filter),

      this.incomesModel.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    return {
      result,
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
        summary: summary[0]?.total ?? 0,
      },
    };
  }

  //GET/incomes/id (Nguyên)
  async geIncomeById(
    id: string,
    userID: string,
    spaceID: string,
    role: string,
  ) {
    const income = await this.incomesModel
      .findOne({ _id: id, spaceID: new Types.ObjectId(spaceID) })
      .populate('categoryID', 'name icon color')
      .populate('userID', 'name avatar')
      .populate('tags', 'name color')
      .lean();

    if (!income) throw new NotFoundException('Không tìm thấy khoản thu');

    if (role === 'member' && income.userID.toString() !== userID) {
      throw new ForbiddenException('Bạn không có quyền xem khoản thu này');
    }

    return income;
  }

  async updateIncome(
    id: string,
    dto: UpdateIncomeDto,
    userId: string,
    spaceId: string,
    role: string,
  ) {
    const income = await this.incomesModel.findOne({
      _id: id,
      spaceID: new Types.ObjectId(spaceId),
    });

    if (!income) throw new NotFoundException('Không tìm thấy khoản thu');

    if (role === 'member' && income.userID.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa khoản thu này');
    }

    const updateData: any = {};
    if (dto.amount !== undefined) updateData.amount = dto.amount;
    if (dto.categoryID)
      updateData.categoryID = new Types.ObjectId(dto.categoryID);
    if (dto.date) updateData.date = new Date(dto.date);
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.tags) {
      updateData.tags = dto.tags.map((t) => new Types.ObjectId(t));
    }

    return this.incomesModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('categoryID', 'name icon color')
      .populate('userID', 'name avatar')
      .populate('tags', 'name color');
  }

  async deleteIncome(
    id: string,
    userID: string,
    spaceID: string,
    role: string,
  ) {
    const income = await this.incomesModel.findOne({
      _id: id,
      spaceID: new Types.ObjectId(spaceID),
    });

    if (!income) throw new NotFoundException('Không tìm thấy khoản thu');

    if (role === 'member' && income.userID.toString() !== userID) {
      throw new ForbiddenException('Bạn không có quyền xóa khoản thu này');
    }

    await this.incomesModel.findByIdAndDelete(id);
    return { message: 'Đã xóa khoản thu' };
  }

  // Lấy tổng hợp theo tháng cho dashboard
  async getMonthlySummary(spaceID: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result = await this.incomesModel.aggregate([
      {
        $match: {
          spaceID: new Types.ObjectId(spaceID),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$categoryId',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          name: '$category.name',
          icon: '$category.icon',
          color: '$category.color',
          totalAmount: 1,
          count: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    return {
      month,
      year,
      totalIncome: result.reduce((s, r) => s + r.totalAmount, 0),
      byCategory: result,
    };
  }
  async getTotalIncomeByMonth(
    spaceID: string,
    month: number,
    year: number,
  ): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result = await this.incomesModel.aggregate([
      {
        $match: {
          spaceID: new Types.ObjectId(spaceID),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return result[0]?.total ?? 0;
  }
}
