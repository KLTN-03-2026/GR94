import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GoalsService } from './goals.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Space, SpaceDocument } from '../space/schema/space.schema';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from '../notification/schema/notification.schema';

@Injectable()
export class GoalsCronService {
  private readonly logger = new Logger(GoalsCronService.name);

  constructor(
    private goalsService: GoalsService,
    @InjectModel(Space.name) private spaceModel: Model<SpaceDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  // Run at 00:00 on the 1st of every month
  @Cron('0 0 1 * *')
  async handleSurplusCheck() {
    this.logger.debug('Running surplus check for all spaces');
    const spaces = await this.spaceModel.find().exec();

    for (const space of spaces) {
      try {
        const surplus = await this.goalsService.getSurplus(
          space._id.toString(),
        );
        if (surplus > 0) {
          const prevMonth = new Date();
          prevMonth.setMonth(prevMonth.getMonth() - 1);
          const monthStr = prevMonth.getMonth() + 1;

          // Create notification
          const notification = new this.notificationModel({
            spaceId: space._id,
            title: '🎉 Số dư tháng trước',
            message: `Tháng ${monthStr} vừa qua gia đình bạn dư ${surplus.toLocaleString('vi-VN')}đ. Bạn có muốn phân bổ số tiền này vào các kế hoạch tương lai không?`,
            type: NotificationType.INFO,
            actionLink: '/dashboard/goals?allocate=true',
          });
          await notification.save();
        }
      } catch (error) {
        this.logger.error(
          `Error checking surplus for space ${space._id}`,
          error,
        );
      }
    }
  }
}
