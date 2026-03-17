import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  // SỬA: thêm accountId, spaceId, role so với bản cũ
  // payload được tạo trong auths.service.ts → login()
  async validate(payload: any) {
    return {
      _id: payload.sub, // User._id
      accountId: payload.accountId, // Account._id — dùng khi đổi mật khẩu
      username: payload.username, // email
      spaceId: payload.spaceId ?? null,
      role: payload.role ?? null,
    };
  }
}
