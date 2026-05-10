import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/create-goal.dto';
import { AllocateSurplusDto } from './dto/allocate-surplus.dto';
import { GetUser } from '@/decorator/get-user.decorator';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  async createGoal(
    @GetUser('spaceId') spaceId: string,
    @Body() createGoalDto: CreateGoalDto,
  ) {
    return await this.goalsService.createGoal(spaceId, createGoalDto);
  }

  @Get()
  async getGoals(@GetUser('spaceId') spaceId: string) {
    return await this.goalsService.getGoals(spaceId);
  }

  @Get('surplus')
  async getSurplus(
    @GetUser('spaceId') spaceId: string,
    @GetUser('_id') userId: string,
    @GetUser('role') role: string,
  ) {
    if (role === 'member') {
      const surplus = await this.goalsService.getSurplusForUser(spaceId, userId);
      return { surplus };
    }
    const surplus = await this.goalsService.getSurplus(spaceId);
    return { surplus };
  }

  @Post('allocate')
  async allocateSurplus(
    @GetUser('spaceId') spaceId: string,
    @GetUser('_id') userId: string,
    @GetUser('role') role: string,
    @Body() allocateDto: AllocateSurplusDto,
  ) {
    return await this.goalsService.allocateSurplus(
      spaceId,
      userId,
      role,
      allocateDto,
    );
  }

  @Get(':id')
  async getGoalById(
    @GetUser('spaceId') spaceId: string,
    @Param('id') id: string,
  ) {
    return await this.goalsService.getGoalById(id, spaceId);
  }

  @Patch(':id')
  async updateGoal(
    @GetUser('spaceId') spaceId: string,
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return await this.goalsService.updateGoal(id, spaceId, updateGoalDto);
  }

  @Delete(':id')
  async deleteGoal(
    @GetUser('spaceId') spaceId: string,
    @Param('id') id: string,
  ) {
    return await this.goalsService.deleteGoal(id, spaceId);
  }

  @Get(':id/history')
  async getGoalHistory(
    @GetUser('spaceId') spaceId: string,
    @Param('id') id: string,
  ) {
    return await this.goalsService.getGoalHistory(id, spaceId);
  }
}
