import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type IncomeDocument = HydratedDocument<Incomes>;

@Schema({ timestamps: true, collection: 'incomes' })
export class Incomes {
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  userID: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Categories', required: true })
  categoryID: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  description: string;
}
