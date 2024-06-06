import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/response/base.response';
import { CreateEtalaseDto } from './etalase.dto';

@Injectable()
export class EtalaseService extends BaseResponse {
  constructor(private prismaService: PrismaService) {
    super();
  }

  async listStoreEtalase(route: string) {
    const store = await this.prismaService.store.findFirst({
      where: {
        OR: [{ route: route }, { id: route }],
      },
    });

    if (!store) throw new HttpException('no store found', 404);

    const etalase = await this.prismaService.etalase.findMany({
      where: {
        store: store,
      },
    });

    return this._success('success get etalase', etalase);
  }

  async addEtalase(storeId: string, payload: CreateEtalaseDto) {
    const store = await this.prismaService.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!store) throw new HttpException('no store found', 404);
    const etalase = await this.prismaService.etalase.findFirst({
      where: {
        name: payload.name,
        store_id: storeId,
      },
    });

    if (!!etalase)
      throw new HttpException(
        'already etalase in this store with that name',
        HttpStatus.FOUND,
      );

    await this.prismaService.etalase.create({
      data: {
        ...payload,
        store: {
          connect: store,
        },
      },
    });

    return this._success('create etalase success');
  }
}
