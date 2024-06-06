import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import {
  JwtAccessTokenStrategy,
  JwtRefreshTokenStrategy,
} from './jwt.strategy';
import { MailModule } from '../mail/mail.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtAccessTokenStrategy, JwtRefreshTokenStrategy],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    MailModule,
  ],
})
export class AuthModule {}
