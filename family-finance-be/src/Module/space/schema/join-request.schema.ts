import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type JoinRequestDocument = HydratedDocument<JoinRequest>;

@Schema({ timestamps: true, collection: 'join_requests' })
export class JoinRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Space', required: true })
  spaceId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;
}

export const JoinRequestSchema = SchemaFactory.createForClass(JoinRequest);
