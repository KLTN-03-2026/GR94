import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { Budget, BudgetSchema } from '../budget/schema/budget.schema';
import { Expenses, ExpensesSchema } from '../expenses/schema/expense.schema';
import {
  Categoris,
  CategorisSchema,
} from '../categoris/schema/categoris.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Budget.name, schema: BudgetSchema },
      { name: Expenses.name, schema: ExpensesSchema },
      { name: Categoris.name, schema: CategorisSchema },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
