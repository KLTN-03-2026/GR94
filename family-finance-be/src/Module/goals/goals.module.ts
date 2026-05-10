import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { Goal, GoalSchema } from './schema/goal.schema';
import { GoalHistory, GoalHistorySchema } from './schema/goal-history.schema';
import { Incomes, IncomesSchema } from '../incomes/schema/income.schema';
import { Expenses, ExpensesSchema } from '../expenses/schema/expense.schema';
import {
  Categoris,
  CategorisSchema,
} from '../categoris/schema/categoris.schema';
import { Space, SpaceSchema } from '../space/schema/space.schema';
import {
  Notification,
  NotificationSchema,
} from '../notification/schema/notification.schema';
import { GoalsCronService } from './goals-cron.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Goal.name, schema: GoalSchema },
      { name: GoalHistory.name, schema: GoalHistorySchema },
      { name: Incomes.name, schema: IncomesSchema },
      { name: Expenses.name, schema: ExpensesSchema },
      { name: Categoris.name, schema: CategorisSchema },
      { name: Space.name, schema: SpaceSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [GoalsController],
  providers: [GoalsService, GoalsCronService],
  exports: [GoalsService],
})
export class GoalsModule {}
