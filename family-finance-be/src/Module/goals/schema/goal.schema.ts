import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type GoalDocument = HydratedDocument<Goal>;

export enum GoalStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Goal extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Space' })
  spaceID: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  targetAmount: number;

  @Prop({ default: 0 })
  currentAmount: number;

  @Prop({ type: Date })
  expectedDate: Date;

  @Prop({ default: '#3b82f6' })
  color: string;

  @Prop({ default: 'target' })
  icon: string;

  @Prop({ enum: GoalStatus, default: GoalStatus.IN_PROGRESS })
  status: GoalStatus;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
