import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

// SỬA: đổi từ 'user'/'admin' → 'parent'/'member'
export enum UserRole {
  PARENT = 'parent',
  MEMBER = 'member',
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  // ── Liên kết với Account ──────────────────────────────
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, unique: true })
  accountId: Types.ObjectId;

  // ── Thông tin cá nhân ─────────────────────────────────
  // SỬA: full_name → name
  @Prop({ required: true, trim: true })
  name: string;

  // Giữ nguyên từ User cũ
  @Prop({
    default:
      'https://i.pinimg.com/736x/20/ef/6b/20ef6b554ea249790281e6677abc4160.jpg',
  })
  avatar: string;

  // ── Vị trí trong Space ────────────────────────────────
  // THÊM MỚI: null = chưa vào phòng → redirect /onboarding
  @Prop({ type: Types.ObjectId, ref: 'Space', default: null })
  spaceId: Types.ObjectId | null;

  // SỬA: enum 'user'/'admin' → 'parent'/'member', default null
  @Prop({ type: String, enum: Object.values(UserRole), default: null })
  role: UserRole | null;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
