import { Controller, Get, Param } from '@nestjs/common';
import { AiService } from './ai.service';
import { GetUser } from '@/decorator/get-user.decorator';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('budget-advice/:budgetId')
  getBudgetAdvice(
    @Param('budgetId') budgetId: string,
    @GetUser('role') role: string,
  ) {
    return this.aiService.getBudgetAdvice(budgetId, role);
  }
}
