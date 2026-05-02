import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthsService } from '../auths.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthsService) {
    // SỬA: thêm usernameField — Passport mặc định dùng 'username'
    // cần override để nhận 'email' từ request body
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    // validateUser trả null nếu email/pass sai — không throw
    const profile = await this.authService.validateUser(email, password);

    if (!profile) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // is_active nằm trong Account — getFullProfile đã trả về
    if (profile.is_active === false) {
      throw new BadRequestException(
        'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.',
      );
    }

    if (profile.is_locked) {
      throw new BadRequestException(
        'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
      );
    }

    return profile; // gắn vào req.user
  }
}
