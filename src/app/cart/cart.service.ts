import { HttpException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/response/base.response';
import { AddToCartDto, AmountDto, UpdateQtyDto } from './cart.dto';

@Injectable()
export class CartService extends BaseResponse {
  constructor(
    private prismaService: PrismaService,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async addToCart(payload: AddToCartDto, productId: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new HttpException('no product found', 404);
    const cart = await this.prismaService.cart.findFirst({
      where: {
        user_id: this.req.user.id,
        product_id: productId,
      },
    });

    if (cart) {
      await this.prismaService.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          quantity: {
            increment: payload.quantity,
          },
        },
      });

      return this._success('add cart success');
    } else {
      await this.prismaService.cart.create({
        data: {
          quantity: payload.quantity,
          user_id: this.req.user.id,
          product_id: product.id,
        },
      });

      return this._success('add cart success');
    }
  }

  async myCart() {
    const cart = await this.prismaService.cart.findMany({
      where: {
        user_id: this.req.user.id,
      },
      include: {
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
    });

    (BigInt.prototype as any).toJSON = function () {
      return Number(this);
    };

    return this._success('list cart success', cart);
  }

  async updateQty(id: string, payload: UpdateQtyDto) {
    const cart = await this.prismaService.cart.findUnique({
      where: {
        id,
      },
    });

    if (!cart) throw new HttpException('no cart found', 404);

    await this.prismaService.cart.update({
      where: cart,
      data: {
        quantity: payload.quantity,
      },
    });

    return this._success('update qty success');
  }

  async getTotalAmount(payload: AmountDto) {
    const cart = await this.prismaService.cart.findMany({
      where: {
        id: {
          in: payload.id,
        },
        user_id: this.req.user.id,
      },
      include: {
        product: true,
      },
    });

    (BigInt.prototype as any).toJSON = function () {
      return Number(this);
    };

    const total = cart.reduce(
      (acc, item) => acc + Number(item.product.price) * item.quantity,
      0,
    );

    return this._success('get total amount', total || 0);
  }
}
