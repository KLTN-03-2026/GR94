import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { GetUser } from '@/decorator/get-user.decorator';
import { GetIncomeDto } from '@/Module/incomes/dto/get-incomes.dto';

@Controller('incomes')
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Get('summary')
  getSummary(
    @Query('month') month: string,
    @Query('year') year: string,
    @GetUser('spaceId') spaceId: string,
  ) {
    const now = new Date();
    return this.incomesService.getMonthlySummary(
      spaceId,
      Number(month) || now.getMonth() + 1,
      Number(year) || now.getFullYear(),
    );
  }

  //POST/incomes
  @Post()
  create(
    @Body() dto: CreateIncomeDto,
    @GetUser('_id') userId: string,
    @GetUser('spaceId') spaceId: string,
  ) {
    return this.incomesService.createIncomes(dto, userId, spaceId);
  }

  //GET/incomes
  @Get()
  findAll(
    @Query() query: GetIncomeDto,
    @GetUser('_id') userId: string,
    @GetUser('spaceId') spaceId: string,
    @GetUser('role') role: string,
  ) {
    return this.incomesService.getIncomes(query, userId, spaceId, role);
  }

  //GET/incomes/:id
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser('_id') userId: string,
    @GetUser('spaceId') spaceId: string,
    @GetUser('role') role: string,
  ) {
    return this.incomesService.geIncomeById(id, userId, spaceId, role);
  }

  //PATCH/incomes/:id
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateIncomeDto,
    @GetUser('_id') userId: string,
    @GetUser('spaceId') spaceId: string,
    @GetUser('role') role: string,
  ) {
    return this.incomesService.updateIncome(id, dto, userId, spaceId, role);
  }

  //DELETE/incomes/:id
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('_id') userId: string,
    @GetUser('spaceId') spaceId: string,
    @GetUser('role') role: string,
  ) {
    return this.incomesService.deleteIncome(id, userId, spaceId, role);
  }
}
