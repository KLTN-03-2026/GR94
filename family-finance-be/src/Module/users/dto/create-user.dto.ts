import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/Module/users/schema/user.shcema';

// ── POST /users — Admin tạo user ─────────────────────────
// SỬA: bỏ phone, address, đổi full_name → name
export class CreateUserDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu có ít nhất 6 ký tự' })
  @MaxLength(50)
  password: string;

  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role phải là parent hoặc member' })
  role?: UserRole;
}
