import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ResetPassDto, SetAvatarDto } from './auth.dto';
import { JwtGuard, JwtGuardRefreshToken } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/role.reflector';
// import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @Post('/login')
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['admin'])
  @Get('/all-acc')
  getAcc() {
    return this.authService.getAcc();
  }

  @UseGuards(JwtGuard)
  @Get('/profile')
  getProfile() {
    return this.authService.getProfile();
  }

  @UseGuards(JwtGuardRefreshToken)
  @Get('/refresh-token')
  refreshToken(@Req() req) {
    const token = req.headers.authorization.split(' ')[1];
    const id = req.user.id;

    return this.authService.refreshToken(id, token);
  }

  @Post('/forgot-password')
  forgotPass(@Body('email') email: string) {
    if (!email)
      throw new HttpException('please enter email', HttpStatus.BAD_REQUEST);
    return this.authService.forgetPass(email);
  }

  @Post('/reset-password/:id/:token')
  resetPass(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory(errors) {
          return new HttpException(
            `testing error : ${errors}`,
            HttpStatus.BAD_REQUEST,
          );
        },
      }),
    )
    id: string,
    @Param('token') token: string,
    @Body() payload: ResetPassDto,
  ) {
    return this.authService.resetPass(token, id, payload);
  }

  @UseGuards(JwtGuard)
  @Put('/set-avatar')
  setAvatar(@Body() payload: SetAvatarDto) {
    return this.authService.setAvatar(payload);
  }
}
