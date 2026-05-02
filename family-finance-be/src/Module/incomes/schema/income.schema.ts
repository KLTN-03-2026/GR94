import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type IncomeDocument = HydratedDocument<Incomes>;

@Schema({ timestamps: true, collection: 'incomes' })
export class Incomes {
  @Prop({ type: Types.ObjectId, ref: 'Spaces', required: true })
  spaceID: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userID: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Categoris', required: true })
  categoryID: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Tag' }], default: [] })
  tags: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

export const IncomesSchema = SchemaFactory.createForClass(Incomes);
