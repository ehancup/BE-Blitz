import { HttpException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateAddressDto,
  FindAddressDto,
  UpdateAddressDto,
} from './address.dto';
import BaseResponse from 'src/utils/response/base.response';

@Injectable()
export class AddressService extends BaseResponse {
  constructor(
    private prismaService: PrismaService,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async getAllAddress() {
    const address = await this.prismaService.address.findMany({
      select: {
        id: true,
        title: true,
        name: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this._success('success', address);
  }

  async getMyAddress(query: FindAddressDto) {
    const { keyword, limit, page, pageSize } = query;
    const user = await this.prismaService.user.findUnique({
      where: {
        id: this.req.user.id,
      },
    });

    if (!user) throw new HttpException('no user found', 404);

    const filterQuery: {
      [key: string]: any;
    } = {};

    if (!!keyword) {
      filterQuery.OR = [
        {
          name: {
            contains: keyword,
            // mode: 'insensitive',
          },
        },
        {
          title: {
            contains: keyword,
            // mode: 'insensitive',
          },
        },
        {
          note: {
            contains: keyword,
            // mode: 'insensitive',
          },
        },
        {
          phone_number: {
            contains: keyword,
            // mode: 'insensitive',
          },
        },
        {
          address: {
            contains: keyword,
          },
        },
      ];
    }
    const total = await this.prismaService.address.count({
      where: {
        user: user,
        ...filterQuery,
      },
    });

    const address = await this.prismaService.address.findMany({
      where: {
        user: user,
        ...filterQuery,
      },
      skip: limit,
      take: pageSize,
    });

    return this._pagination('success', address, total, page, pageSize);
  }

  async createAddress(payload: CreateAddressDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: this.req.user.id,
      },
    });

    if (!user) throw new HttpException('no user found', 404);
    const address = await this.prismaService.address.create({
      data: {
        ...payload,
        user_id: this.req.user.id,
      },
      include: {
        user: true,
      },
    });

    return this._success('success add address', address);
  }

  async deleteMyAddress(id: string) {
    const address = await this.prismaService.address.findUnique({
      where: {
        id,
        user_id: this.req.user.id,
      },
    });

    if (!address) throw new HttpException('no address found', 404);

    await this.prismaService.address.delete({
      where: address,
    });

    return this._success('success delete address');
  }

  async getDetailAddress(id: string) {
    const address = await this.prismaService.address.findUnique({
      where: {
        id,
      },
    });

    if (!address) throw new HttpException('no address found', 404);

    return this._success('success', address);
  }

  async updateAddress(id: string, payload: UpdateAddressDto) {
    const address = await this.prismaService.address.findUnique({
      where: {
        id,
      },
    });

    if (!address) throw new HttpException('no address found', 404);

    const updatedData = await this.prismaService.address.update({
      where: address,
      data: payload,
    });

    return this._success('address updated', updatedData);
  }
}
