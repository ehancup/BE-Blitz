import { HttpException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { TopupWalletDto } from './wallet.dto';
import BaseResponse from 'src/utils/response/base.response';

@Injectable()
export class WalletService extends BaseResponse {
  constructor(
    @Inject(REQUEST) private req: any,
    private prismaServise: PrismaService,
  ) {
    super();
  }

  async topup(payload: TopupWalletDto) {
    const user = await this.prismaServise.user.findUnique({
      where: {
        id: this.req.user.id,
      },
    });

    if (!user) throw new HttpException('no user found', 404);

    await this.prismaServise.wallet.update({
      where: {
        user_id: user.id,
      },
      data: {
        currency: {
          increment: payload.currency,
        },
      },
    });

    return this._success('topup success');
  }

  async myWallet() {
    const user = await this.prismaServise.user.findUnique({
      where: {
        id: this.req.user.id,
      },
    });

    if (!user) throw new HttpException('no user found', 404);

    const wallet = await this.prismaServise.wallet.findUnique({
      where: {
        user_id: user.id,
      },
    });

    (BigInt.prototype as any).toJSON = function () {
      return Number(this);
    };

    return this._success('get mine success', wallet);
  }
}
