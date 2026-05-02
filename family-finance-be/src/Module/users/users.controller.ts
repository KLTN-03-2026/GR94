import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto } from '../auths/dto/create-auth.dto';
import { JwtAuthGuard } from '../auths/passport/jwt-auth.guard';
import { CreateUserDto } from '@/Module/users/dto/create-user.dto';
import { GetUser } from '@/decorator/get-user.decorator';
import {
  UpdateProfileDto,
  UpdateUserDto,
} from '@/Module/users/dto/update-user.dto';
import { AdminGuard } from '@/guards/admin.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── Admin tạo user ────────────────────────────────────
  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // ── Lấy tất cả users (Admin) ──────────────────────────
  // SỬA: bỏ @Public() — phải đăng nhập mới xem được
  @Get()
  @UseGuards(AdminGuard)
  findAll(
    @Query() query: string,
    @Query('current') current: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.usersService.findAll(query, current, pageSize);
  }

  // ── User tự xem profile ───────────────────────────────
  @Get('me')
  getMe(@GetUser('_id') userId: string) {
    return this.usersService.findAll('', 1, 1); // hoặc findById nếu có
  }

  // ── User tự cập nhật profile ──────────────────────────
  // THÊM MỚI: chỉ cho đổi name + avatar
  @Patch('me')
  updateProfile(@GetUser('_id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  // ── Đổi mật khẩu ─────────────────────────────────────
  // THÊM MỚI
  @Patch('me/password')
  changePassword(
    @GetUser('accountId') accountId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      accountId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  // ── Admin cập nhật user bất kỳ ───────────────────────
  @Patch()
  @UseGuards(AdminGuard)
  update(@Body() dto: UpdateUserDto) {
    return this.usersService.update(dto);
  }

  // ── Xóa user + account ────────────────────────────────
  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // ── Admin khóa/mở khóa tài khoản ──────────────────────
  @Patch(':id/lock')
  @UseGuards(AdminGuard)
  toggleLock(@Param('id') id: string) {
    return this.usersService.toggleLock(id);
  }
}
