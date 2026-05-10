import { Controller, Get, Param, Post, Body } from '@nestjs/common';
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

  @Post('voice')
  processVoice(@Body() body: { text: string }) {
    return this.aiService.processVoiceText(body.text);
  }

  @Post('voice-audio')
  processVoiceAudio(@Body() body: { audio: string; mimeType: string; categories?: string[] }) {
    return this.aiService.processVoiceAudio(body.audio, body.mimeType, body.categories);
  }
}
