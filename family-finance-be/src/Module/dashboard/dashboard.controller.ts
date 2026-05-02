import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { GetUser } from '@/decorator/get-user.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@GetUser() user: any, @Query() query: any) {
    const month = query.month ? parseInt(query.month.toString()) : undefined;
    const year = query.year ? parseInt(query.year.toString()) : undefined;

    console.log(`[DashboardController] month: ${month}, year: ${year}`);

    return this.dashboardService.getSummary(
      user?.spaceId,
      user?._id?.toString(),
      user?.role,
      month,
      year,
    );
  }
}
