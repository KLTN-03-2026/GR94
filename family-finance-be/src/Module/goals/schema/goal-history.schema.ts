import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type GoalHistoryDocument = HydratedDocument<GoalHistory>;

@Schema({ timestamps: true })
export class GoalHistory extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Goal' })
  goalID: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Space' })
  spaceID: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userID: Types.ObjectId;

  @Prop({ required: true })
  amount: number; // can be negative if withdrawing from goal

  @Prop({ required: true })
  date: Date;

  @Prop({ default: '' })
  note: string;
}

export const GoalHistorySchema = SchemaFactory.createForClass(GoalHistory);
