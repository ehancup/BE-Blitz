import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './role.reflector';
import { PrismaService } from 'src/prisma/prisma.service';
// import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const roles = this.reflector.get(Roles, context.getHandler());
    const data = await this.prismaService.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    // console.log(data);
    // console.log(req.query);

    if (!roles) {
      return true;
    }
    if (roles.includes(data.role)) {
      return true;
    } else {
      throw new HttpException("you're not allowed", HttpStatus.FORBIDDEN);
    }
    // return true;
  }
}
