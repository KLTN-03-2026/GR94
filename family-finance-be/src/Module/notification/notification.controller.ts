import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ⚠️ QUAN TRỌNG: Route cố định phải đặt TRƯỚC route có :id param
  // Nếu không, NestJS sẽ match "test-cron" vào :id

  // Endpoint dùng để test Cron Job bằng tay (chỉ cho space hiện tại)
  // Thêm ?force=true để bỏ qua kiểm tra "đã có khoản chi chưa"
  @Get('test-cron')
  async triggerTestCron(
    @Request() req: any,
    @Query('force') force: string,
  ) {
    const spaceId = req.user.spaceId;
    await this.notificationService.checkDailyExpensesReminderForSpace(
      spaceId,
      force === 'true',
    );
    return { message: 'Đã chạy thử Cron Job nhắc nhở chi tiêu cho space của bạn' };
  }

  @Get()
  async getNotifications(
    @Request() req: any,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const spaceId = req.user.spaceId;
    return this.notificationService.getNotificationsBySpace(
      spaceId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const userId = req.user._id;
    return this.notificationService.markAsRead(id, userId);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationService.deleteNotification(id);
  }
}
