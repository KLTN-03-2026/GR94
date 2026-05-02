import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AccountDocument = HydratedDocument<Account>;

export enum SystemRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({ timestamps: true, collection: 'accounts' })
export class Account {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  // Flow kích hoạt email
  @Prop({ default: false })
  is_active: boolean;

  @Prop({ default: false })
  is_locked: boolean;

  @Prop({ default: null, type: String })
  code_verification: string | null;

  @Prop({ default: null, type: Date })
  code_expired: Date | null;

  @Prop({
    type: String,
    enum: Object.values(SystemRole),
    default: SystemRole.USER,
  })
  sysRole: SystemRole;

  createdAt: Date;
  updatedAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
