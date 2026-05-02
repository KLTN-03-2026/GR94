import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type TagDocument = HydratedDocument<Tag>;

@Schema({ timestamps: true })
export class Tag extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Space' })
  spaceID: Types.ObjectId;

  @Prop({ default: '#000000' })
  color: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
