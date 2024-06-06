import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto, ResetPassDto, SetAvatarDto } from './auth.dto';
import BaseResponse from 'src/utils/response/base.response';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { REQUEST } from '@nestjs/core';
import * as path from 'path';
import * as fs from 'fs';
// import json from 'src/lib/json';
// import { Wallet } from '@prisma/client';

@Injectable()
export class AuthService extends BaseResponse {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  generateToken(payload: any, exp: string | number) {
    return this.jwtService.sign(payload, {
      expiresIn: exp,
    });
  }

  async getProfile() {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: this.req.user.id,
      },
    });
    if (!user) throw new HttpException('no user found', 404);

    delete user.password;

    return this._success('success', user);
  }

  async register(payload: RegisterDto) {
    const foundData = await this.prismaService.user.findFirst({
      where: {
        provider: 'credential',
        email: payload.email,
      },
    });

    if (foundData)
      throw new HttpException(
        'this email already registered, try  another email',
        HttpStatus.FOUND,
      );
    try {
      const password = await hash(payload.password, 12);
      const data = await this.prismaService.user.create({
        data: {
          ...payload,
          provider: 'credential',
          password: password,
          wallet: {
            create: {
              currency: 0,
            },
          },
        },
      });

      // const wallet = await this.prismaService.wallet.create({
      //   data: {
      //     currency: 0,
      //     user: {
      //       connect: {
      //         id: data.id,
      //       },
      //     },
      //   },
      // });

      return this._success('new account created', data);
    } catch (err) {
      return new HttpException(err, HttpStatus.BAD_GATEWAY);
    }
  }

  async login(payload: LoginDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: payload.email,
        provider: 'credential',
      },
      select: {
        id: true,
        name: true,
        password: true,
        email: true,
        role: true,
      },
    });

    if (!user) throw new HttpException('no user found', HttpStatus.NOT_FOUND);

    const isCorrect = await compare(payload.password, user.password);

    if (isCorrect) {
      delete user.password;

      const accessToken = this.generateToken(user, '1d');
      const refreshToken = this.generateToken(user, '7d');

      // console.table({
      //   access_token: accessToken,
      //   refresh_token: refreshToken,
      // });

      await this.prismaService.user.update({
        where: user,
        data: {
          last_logged_in: new Date(),
          refresh_token: refreshToken,
        },
      });
      return this._success('login successful', {
        ...user,
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } else {
      throw new HttpException(
        'wrong password',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async refreshToken(id: string, token: string) {
    const foundAcc = await this.prismaService.user.findFirst({
      where: {
        id: id,
        refresh_token: token,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        refresh_token: true,
      },
    });

    if (!foundAcc)
      throw new HttpException('no account found', HttpStatus.NOT_FOUND);

    delete foundAcc.refresh_token;

    const accessToken = this.generateToken(foundAcc, '1d');
    const refreshToken = this.generateToken(foundAcc, '7d');

    await this.prismaService.user.update({
      where: {
        id: foundAcc.id,
      },
      data: {
        refresh_token: refreshToken,
      },
    });

    return this._success('success', {
      ...foundAcc,
      refresh_token: refreshToken,
      access_token: accessToken,
    });
  }

  async getAcc() {
    const foundData = await this.prismaService.user.findMany({
      // include: {
      //   wallet: true,
      // },
      select: {
        id: true,
        provider: true,
        role: true,
        name: true,
        email: true,
        wallet: {
          select: {
            id: true,
            currency: true,
          },
        },
        _count: {
          select: {
            cart: true,
            wishlist: true,
          },
        },
      },
      // where: {
      //   name: {
      //     contains: '',
      //   },
      // },
    });

    (BigInt.prototype as any).toJSON = function () {
      return Number(this);
    };
    // const getter = JSON.parse(foundData);

    return this._success('success get all acc', foundData);
  }

  async forgetPass(email: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: email,
        provider: 'credential',
      },
    });

    if (!user) throw new HttpException('no user found', HttpStatus.NOT_FOUND);

    const token = Math.floor(Math.random() * 1000000).toString();
    const link = `http://localhost:${process.env.PORT}/auth/reset-password/${user.id}/${token}`;

    await this.mailService.sendForgotPassword({
      email: user.email,
      link: link,
      name: user.name,
    });

    await this.prismaService.resetPassword.create({
      data: {
        user: {
          connect: user,
        },
        token: token,
      },
    });

    return this._success(`email terkirim ke ${user.email}, silakan cek email`);
  }

  async resetPass(token: string, id: string, payload: ResetPassDto) {
    const resetToken = await this.prismaService.resetPassword.findFirst({
      where: {
        token: token,
        user_id: id,
      },
    });

    if (!resetToken)
      throw new HttpException('invalid token', HttpStatus.UNPROCESSABLE_ENTITY);

    payload.password = await hash(payload.password, 12);

    await this.prismaService.user.update({
      where: {
        id: id,
      },
      data: {
        password: payload.password,
      },
    });
    await this.prismaService.resetPassword.deleteMany({
      where: {
        user_id: id,
      },
    });

    return this._success('password reseted successfully, please try again');
  }

  async setAvatar(payload: SetAvatarDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: this.req.user.id,
      },
    });
    if (!user) throw new HttpException('no user found', 404);

    try {
      const fileName = user.avatar.split('/').pop();
      const filePath = `/public/uploads/${fileName}`;
      const pathName = path.join(__dirname, '../../..', filePath);
      // console.log(pathName);
      fs.unlinkSync(pathName);
    } catch (err) {
      console.log(err);
    }

    await this.prismaService.user.update({
      where: user,
      data: {
        avatar: payload.avatar,
      },
    });

    return this._success('success');
  }
}

('<h1>apakek<h1/>');
