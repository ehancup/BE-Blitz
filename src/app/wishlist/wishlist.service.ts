import { HttpException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/response/base.response';
import { FindAllWishlist } from './wishlist.dto';

@Injectable()
export class WishlistService extends BaseResponse {
  constructor(
    @Inject(REQUEST) private req: any,
    private prismaService: PrismaService,
  ) {
    super();
  }

  async addToWishlist(productId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: this.req.user.id,
      },
    });

    if (!user) throw new HttpException('no user found', 404);

    const product = await this.prismaService.product.findUnique({
      where: {
        id: productId,
      },
    });
    if (!product) throw new HttpException('no product found', 404);
    const wishlist = await this.prismaService.wishlist.findFirst({
      where: {
        product_id: productId,
        user_id: user.id,
      },
    });
    if (wishlist) {
      await this.prismaService.wishlist.delete({
        where: {
          id: wishlist.id,
        },
      });

      return this._success('wishlist deleted');
    }

    await this.prismaService.wishlist.create({
      data: {
        user_id: user.id,
        product_id: product.id,
      },
    });

    return this._success('wishlist success');
  }

  async listWishllist(query: FindAllWishlist) {
    const { keyword, from_price, to_price, page, pageSize, limit, type } =
      query;
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
          },
        },
        {
          description: {
            contains: keyword,
          },
        },
        {
          categoryToProduct: {
            some: {
              category: {
                name: {
                  contains: keyword,
                },
              },
            },
          },
        },
      ];
    }

    if (!!type) {
      filterQuery.type = type;
    }

    if (!!from_price && !!to_price) {
      filterQuery.price = {
        gte: from_price,
        lte: to_price,
      };
    } else if (!!from_price && !to_price) {
      filterQuery.price = {
        gte: from_price,
      };
    } else if (!!to_price && !from_price) {
      filterQuery.price = {
        lte: to_price,
      };
    }

    const total = await this.prismaService.wishlist.count({
      where: {
        user_id: user.id,
        product: filterQuery,
      },
    });

    const wishlist = await this.prismaService.wishlist.findMany({
      where: {
        user_id: user.id,
        product: filterQuery,
      },
      select: {
        id: true,
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            store: {
              select: {
                id: true,
                name: true,
              },
            },
            image: {
              select: {
                id: true,
                image: true,
              },
              orderBy: {
                image: 'asc',
              },
            },
            categoryToProduct: {
              select: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            price: true,
            stock: true,
            etalase: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      skip: limit,
      take: pageSize,
    });

    (BigInt.prototype as any).toJSON = function () {
      return Number(this);
    };

    return this._pagination('success', wishlist, total, page, pageSize);
  }

  async deleteWishlist(id: string) {
    const wishlist = await this.prismaService.wishlist.findFirst({
      where: {
        id,
      },
    });

    if (!wishlist) throw new HttpException('no wishlist found', 404);

    await this.prismaService.wishlist.delete({
      where: wishlist,
    });

    return this._success('delete wishlist');
  }
}
