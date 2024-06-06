import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
// import { Observable } from 'rxjs';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    if (req.user.role == 'seller') {
      const isOwner = await this.prismaService.store.findFirst({
        where: {
          id: req.params.id,
          created_by: {
            id: req.user.id,
          },
        },
      });
      // console.log(isOwner);
      // console.log(!!isOwner);
      // console.log(req.params);
      // console.log(req.user);
      if (!!isOwner) {
        return true;
      } else {
        throw new HttpException("you're not the owner", HttpStatus.FORBIDDEN);
      }
    } else {
      return true;
    }
  }
}
