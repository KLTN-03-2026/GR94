import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordHelper } from '@/helper/util';

import {
  Account,
  AccountDocument,
} from '@/Module/account/schema/account.schema';
import { UsersService } from '@/Module/users/users.service';
import {
  CreateAuthDto,
  ResendCodeDto,
  VerifyAccountDto,
} from '@/Module/auths/dto/create-auth.dto';

@Injectable()
export class AuthsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // ── Dùng với Passport Local Strategy ──────────────────
  // Bước 1: tìm Account theo email
  // Bước 2: so sánh password với passwordHash
  // Bước 3: trả về fullProfile (Account + User gộp lại)
  async validateUser(email: string, pass: string): Promise<any> {
    const account = await this.usersService.findAccountByEmail(email);
    if (!account) return null;

    const isValid = await comparePasswordHelper(pass, account.passwordHash);
    if (!isValid) return null;

    // Gộp Account + User → đủ data để tạo JWT
    return this.usersService.getFullProfile(account._id);
  }

  // ── Đăng nhập ─────────────────────────────────────────
  // SỬA: thêm accountId + spaceId + role vào JWT payload
  async login(profile: any) {
    const payload = {
      sub: profile._id, // User._id
      accountId: profile.accountId, // Account._id
      username: profile.email,
      spaceId: profile.spaceId ?? null,
      role: profile.role ?? null,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      // Trả thêm user info để frontend lưu vào store ngay
      user: {
        _id: profile._id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        spaceId: profile.spaceId ?? null,
        role: profile.role ?? null,
      },
    };
  }

  // ── Đăng ký ───────────────────────────────────────────
  // Delegate xuống UsersService
  async handleRegister(dto: CreateAuthDto) {
    return this.usersService.handleRegister(dto);
  }

  // ── Kích hoạt tài khoản ───────────────────────────────
  // THÊM MỚI: user nhập email + code 6 số nhận từ email
  async verifyAccount(dto: VerifyAccountDto) {
    const account = await this.accountModel.findOne({
      email: dto.email.toLowerCase(),
    });

    if (!account) {
      throw new BadRequestException('Email không tồn tại');
    }
    if (account.is_active) {
      throw new BadRequestException('Tài khoản đã được kích hoạt rồi');
    }
    if (account.code_verification !== dto.code) {
      throw new BadRequestException('Mã xác thực không đúng');
    }
    if (!account.code_expired || account.code_expired < new Date()) {
      throw new BadRequestException(
        'Mã xác thực đã hết hạn. Vui lòng yêu cầu gửi lại.',
      );
    }

    await this.usersService.activateAccount(account._id.toString());

    return { message: 'Kích hoạt tài khoản thành công. Bạn có thể đăng nhập.' };
  }

  // ── Gửi lại mã kích hoạt ─────────────────────────────
  // THÊM MỚI
  async resendVerifyCode(dto: ResendCodeDto) {
    return this.usersService.resendVerifyCode(dto.email);
  }
}
