import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/response/base.response';
import { CreateOrderDto, OrderDetailDto } from './order.dto';

@Injectable()
export class OrderService extends BaseResponse {
  constructor(
    private prismaService: PrismaService,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async createOrder(payload: CreateOrderDto) {
    const cart = await this.prismaService.cart.findMany({
      where: {
        id: {
          in: payload.data,
        },
        user_id: this.req.user.id,
      },
      include: {
        product: {
          include: {
            store: true,
          },
        },
      },
    });

    (BigInt.prototype as any).toJSON = function () {
      return Number(this);
    };

    // const grouped = cart.reduce(
    //   (acc: { [key: string]: GroupedByStoreItem }, item: typeof cart) => {
    //     const storeId = item.product.store.id;
    //     if (!acc[storeId]) {
    //       acc[storeId] = {
    //         store: item.product.store,
    //         items: [],
    //       };
    //     }
    //     acc[storeId].items.push(item);
    //     return acc;
    //   },
    //   {},
    // );

    console.log(cart);

    const orderItem: OrderDetailDto[] = cart.map((item) => {
      return {
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: Number(item.product.price),
        quantity: item.quantity,
        total_amount: Number(item.product.price) * item.quantity,
      };
    });

    return this._success('test');
  }
}
