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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { GetUser } from '@/decorator/get-user.decorator';
import { GetExpensesDto } from '@/Module/expenses/dto/get-expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('summary')
  getSummary(
    @Query('month') month: string,
    @Query('year') year: string,
    @GetUser('spaceId') spaceId: string,
  ) {
    const now = new Date();
    return this.expensesService.getMonthlySummary(
      spaceId,
      Number(month) || now.getMonth() + 1,
      Number(year) || now.getFullYear(),
    );
  }

  //POST/expenses
  @Post()
  create(
    @Body() dto: CreateExpenseDto,
    @GetUser('_id') userId: string,
    @GetUser('spaceId') spaceId: string,
  ) {
    return this.expensesService.createExpense(dto, userId, spaceId);
  }

  //GET/expenses
  @Get()
  findAll(
    @Query() query: GetExpensesDto,
    @GetUser('_id') userId: string,
    @GetUser('spaceId') spaceId: string,
    @GetUser('role') role: string,
  ) {
    return this.expensesService.getExpenses(query, userId, spaceId, role);
  }

  //GET/expenses/:id
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser('_id') userId: string,
    @GetUser('spaceId') spaceId: string,
    @GetUser('role') role: string,
  ) {
    return this.expensesService.getExpenseById(id, userId, spaceId, role);
  }

  //PATCH/expenses/:id
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @GetUser('_id') userId: string,
    @GetUser('spaceId') spaceId: string,
    @GetUser('role') role: string,
  ) {
    return this.expensesService.updateExpense(id, dto, userId, spaceId, role);
  }

  //DELETE/expenses/:id
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('_id') userId: string,
    @GetUser('spaceId') spaceId: string,
    @GetUser('role') role: string,
  ) {
    return this.expensesService.deleteExpense(id, userId, spaceId, role);
  }
}
