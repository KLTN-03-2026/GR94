import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationType } from './schema/notification.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { Space } from '@/Module/space/schema/space.schema';
import { User } from '@/Module/users/schema/user.shcema';
import { Account } from '@/Module/account/schema/account.schema';
import { Cron } from '@nestjs/schedule';
import { Expenses } from '@/Module/expenses/schema/expense.schema';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(Space.name) private spaceModel: Model<Space>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Expenses.name) private expensesModel: Model<Expenses>,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * Tạo cảnh báo và gửi email không đồng bộ (non-blocking)
   */
  async triggerBudgetAlert(
    spaceId: string,
    categoryName: string,
    percentage: number,
    spentAmount: number,
    limitAmount: number,
  ) {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Ràng buộc chống Spam: Check xem trong tháng này CÙNG category này đã được báo hay chưa?
      // Bằng cách search Notification Title theo pattern.
      // Dùng regex để check title có chứa tên category không (Đây là cách đơn giản nhất)
      const existingAlert = await this.notificationModel.findOne({
        spaceId: new Types.ObjectId(spaceId),
        title: { $regex: categoryName, $options: 'i' },
        createdAt: {
          $gte: new Date(year, month - 1, 1),
          $lte: new Date(year, month, 0, 23, 59, 59),
        },
      });

      if (existingAlert) {
        // Đã gửi email và cảnh báo rồi => Bỏ qua để chống Spam
        return;
      }

      // Lưu cảnh báo vào database
      await this.notificationModel.create({
        spaceId: new Types.ObjectId(spaceId),
        title: `⚠️ Ngân sách ${categoryName} vượt ngưỡng ${percentage}%`,
        message: `Đã chi: ${spentAmount.toLocaleString('vi-VN')} / ${limitAmount.toLocaleString('vi-VN')} VNĐ`,
        type: NotificationType.WARNING,
        actionLink: '/dashboard',
      });

      // Gửi Email không đồng bộ (Chạy ngầm)
      this.sendAlertEmails(
        spaceId,
        categoryName,
        percentage,
        spentAmount,
        limitAmount,
      ).catch((e) => {
        this.logger.error('Failed to send budget alert email: ' + e.message);
      });
    } catch (error) {
      this.logger.error('Error triggering budget alert: ' + error.message);
    }
  }

  private async sendAlertEmails(
    spaceId: string,
    categoryName: string,
    percentage: number,
    spentAmount: number,
    limitAmount: number,
  ) {
    // Tìm Space để lấy tên phòng và ids thành viên
    const space = await this.spaceModel.findById(spaceId).lean();
    if (!space || !space.membersId || space.membersId.length === 0) return;

    // Lấy thông tin user để có accountId
    const users = await this.userModel
      .find({ _id: { $in: space.membersId } })
      .lean();
    const accountIds = users.filter((u) => u.accountId).map((u) => u.accountId);

    if (accountIds.length === 0) return;

    // Lấy ra email các account
    const accounts = await this.accountModel
      .find({ _id: { $in: accountIds } })
      .lean();
    const emails = accounts.map((a) => a.email).filter(Boolean);

    if (emails.length === 0) return;

    // Gửi email hàng loạt (Sử dụng bcc hoặc vòng lặp. Dùng sendMail đến từng email hoặc array To)
    const context = {
      spaceName: space.name,
      categoryName,
      percentage: Math.round(percentage),
      spentAmount: spentAmount.toLocaleString('vi-VN'),
      limitAmount: limitAmount.toLocaleString('vi-VN'),
      appUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    };

    await this.mailerService.sendMail({
      to: emails,
      subject: `[CẢNH BÁO] Ngân sách ${categoryName} chạm ${Math.round(percentage)}%`,
      template: './budget-alert',
      context,
    });

    this.logger.log(
      `Sent budget alert email for category ${categoryName} to ${emails.length} users.`,
    );
  }

  async triggerNewJoinRequest(spaceId: string, userName: string) {
    try {
      await this.notificationModel.create({
        spaceId: new Types.ObjectId(spaceId),
        title: `👋 Yêu cầu tham gia mới`,
        message: `${userName} muốn tham gia vào gia đình của bạn. Vui lòng kiểm tra tab "Thành viên" để phê duyệt.`,
        type: NotificationType.INFO,
        actionLink: '/dashboard/members',
      });
    } catch (error) {
      this.logger.error(
        'Error triggering new join request alert: ' + error.message,
      );
    }
  }

  // Get notifications cho giao diện UI
  async getNotificationsBySpace(spaceId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [result, total] = await Promise.all([
      this.notificationModel
        .find({ spaceId: new Types.ObjectId(spaceId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.notificationModel.countDocuments({
        spaceId: new Types.ObjectId(spaceId),
      }),
    ]);

    return {
      data: result,
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(id: string, userId: string) {
    return this.notificationModel.findByIdAndUpdate(
      id,
      { $addToSet: { isRead: new Types.ObjectId(userId) } },
      { new: true },
    );
  }

  async deleteNotification(id: string) {
    return this.notificationModel.findByIdAndDelete(id);
  }

  @Cron('0 20 * * *', { timeZone: 'Asia/Ho_Chi_Minh' }) // 8 PM Vietnam time every day
  async checkDailyExpensesReminder() {
    this.logger.log('Running daily expenses reminder job...');
    try {
      // 1. Get all spaces
      const spaces = await this.spaceModel.find().lean();
      if (!spaces || spaces.length === 0) return;

      // 2. Define today's time range
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // 3. For each space, check if there are expenses today
      for (const space of spaces) {
        const hasExpense = await this.expensesModel.exists({
          spaceID: space._id,
          date: { $gte: todayStart, $lte: todayEnd },
        });

        // 4. If no expense, send email and save notification
        if (!hasExpense) {
          await this.triggerDailyReminder(
            space._id.toString(),
            space.name,
            space.membersId,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Error running daily expenses reminder job: ' + error.message,
      );
    }
  }

  /**
   * Test Cron cho 1 space duy nhất (dùng cho endpoint test-cron)
   * @param force - Nếu true, bỏ qua kiểm tra "đã có khoản chi chưa" → luôn gửi nhắc nhở
   */
  async checkDailyExpensesReminderForSpace(spaceId: string, force = false) {
    this.logger.log(
      `Running daily expenses reminder for space: ${spaceId} (force=${force})`,
    );
    try {
      const space = await this.spaceModel.findById(spaceId).lean();
      if (!space) {
        this.logger.warn(`Space ${spaceId} not found`);
        return;
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      let shouldSend = force; // Nếu force=true → luôn gửi

      if (!force) {
        const hasExpense = await this.expensesModel.exists({
          spaceID: space._id,
          date: { $gte: todayStart, $lte: todayEnd },
        });
        shouldSend = !hasExpense;
      }

      if (shouldSend) {
        await this.triggerDailyReminder(
          space._id.toString(),
          space.name,
          space.membersId,
        );
        this.logger.log(`Reminder sent for space: ${space.name}`);
      } else {
        this.logger.log(
          `Space ${space.name} already has expenses today, skipping.`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Error running daily reminder for space: ' + error.message,
      );
    }
  }

  private async triggerDailyReminder(
    spaceId: string,
    spaceName: string,
    memberIds: Types.ObjectId[],
  ) {
    // 1. Save Notification to DB
    const title = 'Đừng quên ghi chép chi tiêu hôm nay!';

    // Check if notification already exists for today to avoid duplicate entries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const existingNotification = await this.notificationModel.findOne({
      spaceId: new Types.ObjectId(spaceId),
      title: title,
      createdAt: { $gte: todayStart },
    });

    if (!existingNotification) {
      await this.notificationModel.create({
        spaceId: new Types.ObjectId(spaceId),
        title: title,
        message:
          'Bạn chưa có khoản chi tiêu nào được ghi nhận trong hôm nay. Hãy dành 1 phút để ghi chép lại nhé.',
        type: NotificationType.INFO,
        actionLink: '/dashboard/transaction',
      });
    }

    // 2. Send Emails
    if (!memberIds || memberIds.length === 0) return;

    const users = await this.userModel.find({ _id: { $in: memberIds } }).lean();
    const accountIds = users.filter((u) => u.accountId).map((u) => u.accountId);
    if (accountIds.length === 0) return;

    const accounts = await this.accountModel
      .find({ _id: { $in: accountIds } })
      .lean();
    const emails = accounts.map((a) => a.email).filter(Boolean);
    if (emails.length === 0) return;

    const context = {
      spaceName,
      appUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    };

    await this.mailerService
      .sendMail({
        to: emails,
        subject: `[Nhắc nhở] Đừng quên ghi chép chi tiêu hôm nay tại ${spaceName}`,
        template: './daily-reminder',
        context,
      })
      .catch((e) => {
        this.logger.error(
          `Failed to send daily reminder email to ${emails.join(', ')}: ` +
            e.message,
        );
      });

    this.logger.log(
      `Sent daily reminder email for space ${spaceName} to ${emails.length} users.`,
    );
  }
}
