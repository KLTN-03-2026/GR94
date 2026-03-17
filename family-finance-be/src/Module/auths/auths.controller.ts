import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from '@/decorator/customize';
import { AuthsService } from '@/Module/auths/auths.service';
import {
  CreateAuthDto,
  ResendCodeDto,
  VerifyAccountDto,
} from '@/Module/auths/dto/create-auth.dto';

@Controller('auths')
export class AuthsController {
  // SỬA: bỏ inject MailerService — controller không dùng trực tiếp
  constructor(private readonly authsService: AuthsService) {}

  // POST /auths/login
  // LocalAuthGuard chạy local.strategy.validate() trước
  // → kiểm tra email/password + is_active
  // → gắn profile vào req.user
  // → controller gọi login() để ký JWT
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Request() req) {
    return this.authsService.login(req.user);
  }

  // ── POST /auths/register
  // Tạo Account + User, gửi mã 6 số qua email
  @Public()
  @Post('register')
  register(@Body() dto: CreateAuthDto) {
    return this.authsService.handleRegister(dto);
  }

  // POST /auths/verify-account
  // THÊM MỚI: kích hoạt tài khoản bằng mã 6 số
  @Public()
  @Post('verify-account')
  @HttpCode(HttpStatus.OK)
  verifyAccount(@Body() dto: VerifyAccountDto) {
    return this.authsService.verifyAccount(dto);
  }

  // POST /auths/resend-code ───
  // THÊM MỚI: gửi lại mã khi hết hạn
  @Public()
  @Post('resend-code')
  @HttpCode(HttpStatus.OK)
  resendCode(@Body() dto: ResendCodeDto) {
    return this.authsService.resendVerifyCode(dto);
  }
}
