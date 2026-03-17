// space.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SpaceDocument = HydratedDocument<Space>;

@Schema({ timestamps: true })
export class Space {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  membersId: Types.ObjectId[];

  @Prop({ required: true, unique: true, uppercase: true })
  invitedCode: string;

  @Prop({ type: [Number], default: [80, 100] })
  alertThresholds: number[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const SpaceSchema = SchemaFactory.createForClass(Space);
