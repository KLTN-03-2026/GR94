import { Module } from '@nestjs/common';

import { AuthsController } from './auths.controller';
import { JwtStrategy } from './passport/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from '@/Module/account/schema/account.schema';
import { UsersModule } from '@/Module/users/users.module';
import { AuthsService } from '@/Module/auths/auths.service';

@Module({
  imports: [
    UsersModule,
    // SỬA: thêm Account model — AuthService.verifyAccount() cần truy vấn trực tiếp
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: {
          // SỬA: đổi '1000d' → '7d' — hợp lý hơn cho production
          expiresIn: (configService.get<string>('JWT_ACCESS_TOKEN_EXPIRED') ||
            '7d') as StringValue,
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  controllers: [AuthsController],
  providers: [AuthsService, LocalStrategy, JwtStrategy],
  exports: [AuthsService],
})
export class AuthsModule {}
