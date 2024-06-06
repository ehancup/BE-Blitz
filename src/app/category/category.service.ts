import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './category.dto';
import BaseResponse from 'src/utils/response/base.response';

@Injectable()
export class CategoryService extends BaseResponse {
  constructor(
    private prismaService: PrismaService,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async createCategory(payload: CreateCategoryDto) {
    const category = await this.prismaService.category.findFirst({
      where: {
        name: payload.name,
      },
    });

    if (!!category)
      throw new HttpException(
        'category name already used',
        HttpStatus.NOT_ACCEPTABLE,
      );

    await this.prismaService.category.create({
      data: {
        ...payload,
        user_id: this.req.user.id,
      },
    });

    return this._success('category created successfully');
  }

  async list() {
    const category = await this.prismaService.category.findMany({
      select: {
        id: true,
        name: true,
        created_by: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return this._success('category list successfully', category);
  }
}
