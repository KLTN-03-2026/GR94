import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Goal, GoalDocument, GoalStatus } from './schema/goal.schema';
import { GoalHistory, GoalHistoryDocument } from './schema/goal-history.schema';
import { CreateGoalDto, UpdateGoalDto } from './dto/create-goal.dto';
import { AllocateSurplusDto } from './dto/allocate-surplus.dto';
import { Incomes, IncomeDocument } from '../incomes/schema/income.schema';
import { Expenses, ExpensesDocument } from '../expenses/schema/expense.schema';
import {
  Categoris,
  CategorisDocument,
  CategorisType,
} from '../categoris/schema/categoris.schema';

@Injectable()
export class GoalsService {
  constructor(
    @InjectModel(Goal.name) private goalModel: Model<GoalDocument>,
    @InjectModel(GoalHistory.name)
    private goalHistoryModel: Model<GoalHistoryDocument>,
    @InjectModel(Incomes.name) private incomeModel: Model<IncomeDocument>,
    @InjectModel(Expenses.name) private expenseModel: Model<ExpensesDocument>,
    @InjectModel(Categoris.name)
    private categoryModel: Model<CategorisDocument>,
  ) {}

  async createGoal(spaceID: string, createGoalDto: CreateGoalDto) {
    const newGoal = new this.goalModel({
      ...createGoalDto,
      spaceID: new Types.ObjectId(spaceID),
    });
    return await newGoal.save();
  }

  async getGoals(spaceID: string) {
    return await this.goalModel
      .find({ spaceID: new Types.ObjectId(spaceID) })
      .sort({ createdAt: -1 });
  }

  async getGoalById(id: string, spaceID: string) {
    const goal = await this.goalModel.findOne({
      _id: new Types.ObjectId(id),
      spaceID: new Types.ObjectId(spaceID),
    });
    if (!goal) throw new NotFoundException('Goal not found');
    return goal;
  }

  async updateGoal(id: string, spaceID: string, updateGoalDto: UpdateGoalDto) {
    const goal = await this.goalModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), spaceID: new Types.ObjectId(spaceID) },
      { $set: updateGoalDto },
      { new: true },
    );
    if (!goal) throw new NotFoundException('Goal not found');
    return goal;
  }

  async deleteGoal(id: string, spaceID: string) {
    const goal = await this.goalModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      spaceID: new Types.ObjectId(spaceID),
    });
    if (!goal) throw new NotFoundException('Goal not found');

    // Also delete history
    await this.goalHistoryModel.deleteMany({ goalID: new Types.ObjectId(id) });
    return { message: 'Goal deleted successfully' };
  }

  async getSurplus(spaceID: string) {
    const incomes = await this.incomeModel.aggregate([
      { $match: { spaceID: new Types.ObjectId(spaceID) } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const expenses = await this.expenseModel.aggregate([
      { $match: { spaceID: new Types.ObjectId(spaceID) } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalIncome = incomes.length > 0 ? incomes[0].total : 0;
    const totalExpense = expenses.length > 0 ? expenses[0].total : 0;

    return totalIncome - totalExpense;
  }

  async getSurplusForUser(spaceID: string, userID: string) {
    const incomes = await this.incomeModel.aggregate([
      { $match: { spaceID: new Types.ObjectId(spaceID), userID: new Types.ObjectId(userID) } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const expenses = await this.expenseModel.aggregate([
      { $match: { spaceID: new Types.ObjectId(spaceID), userID: new Types.ObjectId(userID) } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalIncome = incomes.length > 0 ? incomes[0].total : 0;
    const totalExpense = expenses.length > 0 ? expenses[0].total : 0;

    return totalIncome - totalExpense;
  }

  async allocateSurplus(
    spaceID: string,
    userID: string,
    role: string,
    allocateDto: AllocateSurplusDto,
  ) {
    const session = await this.goalModel.db.startSession();
    session.startTransaction();

    try {
      // 1. Calculate total allocation amount
      const totalAllocation = allocateDto.allocations.reduce(
        (sum, item) => sum + item.amount,
        0,
      );

      // 2. Check if surplus is enough
      const surplus = role === 'member'
        ? await this.getSurplusForUser(spaceID, userID)
        : await this.getSurplus(spaceID);
        
      if (totalAllocation > surplus) {
        throw new BadRequestException('Not enough surplus to allocate');
      }

      // 3. Find or create a category for "Tiết kiệm mục tiêu"
      let category = await this.categoryModel
        .findOne({
          spaceId: new Types.ObjectId(spaceID),
          name: 'Tiết kiệm mục tiêu',
          type: CategorisType.EXPENSE,
        })
        .session(session);

      if (!category) {
        category = new this.categoryModel({
          spaceId: new Types.ObjectId(spaceID),
          name: 'Tiết kiệm mục tiêu',
          icon: 'piggy-bank',
          type: CategorisType.EXPENSE,
          isSystem: false,
        });
        await category.save({ session });
      }

      const now = new Date();

      // 4. Process each allocation
      for (const item of allocateDto.allocations) {
        if (item.amount <= 0) continue;

        const goal = await this.goalModel
          .findOne({
            _id: new Types.ObjectId(item.goalID),
            spaceID: new Types.ObjectId(spaceID),
          })
          .session(session);

        if (!goal) throw new NotFoundException(`Goal ${item.goalID} not found`);

        // Create Goal History
        const history = new this.goalHistoryModel({
          goalID: goal._id,
          spaceID: new Types.ObjectId(spaceID),
          userID: new Types.ObjectId(userID),
          amount: item.amount,
          date: now,
          note: 'Phân bổ từ số dư',
        });
        await history.save({ session });

        // Update Goal currentAmount
        goal.currentAmount += item.amount;
        if (goal.currentAmount >= goal.targetAmount) {
          goal.status = GoalStatus.COMPLETED;
        }
        await goal.save({ session });
      }

      // 5. Create a virtual Expense to deduct from surplus
      if (totalAllocation > 0) {
        const expense = new this.expenseModel({
          spaceID: new Types.ObjectId(spaceID),
          userID: new Types.ObjectId(userID),
          categoryID: category._id,
          amount: totalAllocation,
          date: now,
          description: 'Phân bổ số dư vào các mục tiêu',
          tags: [],
        });
        await expense.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      return { message: 'Allocation successful' };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getGoalHistory(goalID: string, spaceID: string) {
    return await this.goalHistoryModel
      .find({
        goalID: new Types.ObjectId(goalID),
        spaceID: new Types.ObjectId(spaceID),
      })
      .sort({ date: -1 })
      .populate('userID', 'name avatar');
  }
}
