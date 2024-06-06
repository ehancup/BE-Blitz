import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreDto, FindAllStore } from './store.dto';
import { REQUEST } from '@nestjs/core';
import BaseResponse from 'src/utils/response/base.response';
// import { Request } from 'express';

@Injectable()
export class StoreService extends BaseResponse {
  constructor(
    private prismaService: PrismaService,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async createStore(payload: CreateStoreDto) {
    const found = await this.prismaService.store.findFirst({
      where: {
        OR: [
          {
            name: payload.name,
          },
          {
            route: payload.route,
          },
        ],
      },
    });

    if (found)
      throw new HttpException(
        'already store with that name or route',
        HttpStatus.FOUND,
      );

    await this.prismaService.store.create({
      data: {
        ...payload,
        user_id: this.req.user.id,
      },
    });

    return this._success('create store successfully');
  }

  async findAll(query: FindAllStore) {
    const { keyword, location, owner, limit, page, pageSize } = query;

    const filterQuery: {
      [key: string]: any;
    } = {};

    if (!!keyword) {
      filterQuery.OR = [
        {
          name: {
            contains: keyword,
          },
        },
        {
          description: {
            contains: keyword,
          },
        },
      ];
    }

    if (!!owner) {
      filterQuery.created_by = {
        OR: [
          { id: owner },
          {
            name: {
              contains: owner,
            },
          },
          {
            email: {
              contains: owner,
            },
          },
        ],
      };
    }

    if (!!location) {
      filterQuery.location = {
        contains: location,
      };
    }

    const finds = await this.prismaService.store.findMany({
      where: filterQuery,
      skip: limit,
      take: pageSize,
      // orderBy: {
      //   product: {
      //     _count: 'asc',
      //   },
      // },
    });
    const total = await this.prismaService.store.count({
      where: filterQuery,
    });

    return this._pagination('successfully get', finds, total, page, pageSize);
  }

  async deleteStore(id: string) {
    const store = await this.prismaService.store.findUnique({
      where: {
        id: id,
      },
    });

    if (!store) throw new HttpException('no store found', HttpStatus.NOT_FOUND);

    await this.prismaService.store.delete({
      where: store,
    });

    return this._success('store deleted successfully');
  }

  async getDetail(route: string) {
    const store = await this.prismaService.store.findFirst({
      where: {
        OR: [{ route: route }, { id: route }],
      },
      include: {
        etalase: true,
        created_by: true,
        _count: true,
      },
    });

    if (!store) throw new HttpException('no store found', HttpStatus.NOT_FOUND);

    return this._success('store found', store);
  }

  async getOwnerStore() {
    const store = await this.prismaService.store.findMany({
      where: {
        created_by: {
          id: this.req.user.id,
        },
      },
    });

    return this._success('store found', store);
  }
}
