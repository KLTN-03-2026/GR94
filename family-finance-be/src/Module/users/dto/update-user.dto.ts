// ── PATCH /users/me — User tự cập nhật profile ───────────
// THÊM MỚI: tách riêng — chỉ cho đổi name + avatar
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { UserRole } from 'src/Module/users/schema/user.shcema';

// Không cho đổi: role, spaceId, accountId, email
export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'Tên phải là chuỗi' })
  @MaxLength(50, { message: 'Tên tối đa 50 ký tự' })
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

// ── PATCH /users — Admin cập nhật user bất kỳ ────────────
// SỬA so với bản cũ: bỏ email, phone, address, thêm role
export class UpdateUserDto {
  @IsMongoId({ message: '_id không hợp lệ' })
  @IsNotEmpty({ message: '_id không được để trống' })
  _id: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role phải là parent hoặc member' })
  role?: UserRole;
}
