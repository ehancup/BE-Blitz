import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/response/base.response';
import {
  CreateOrderDto,
  CreateSingleOrderDto,
  OrderDetailDto,
  SellerListDto,
  UpdateStatusDto,
  UserListDto,
} from './order.dto';

type Store = {
  id: string;
  name: string;
  route: string;
  avatar: string;
  description: string;
  location: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: bigint;
  type: string;
  stock: number;
  store_id: string;
  etalase_id: string;
  created_at: Date;
  updated_at: Date;
  store: Store;
  quantity: number;
};

type GroupedItem = {
  store: Store;
  products: Product[];
};

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

    if (payload.data.length != cart.length)
      throw new HttpException('some of cart are missing', 404);

    const totalPrice = cart.reduce(
      (acc, item) => acc + Number(item.product.price) * item.quantity,
      0,
    );

    const wallet = await this.prismaService.wallet.findUnique({
      where: {
        user_id: this.req.user.id,
      },
    });

    if (!wallet) throw new HttpException('no wallet found', 404);

    if (Number(wallet.currency) < totalPrice)
      throw new HttpException(
        'you dont have enough money',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    const groupedItems = cart.reduce(
      (acc, item) => {
        const storeId = item.product.store_id;
        if (!acc[storeId]) {
          acc[storeId] = {
            store: item.product.store,
            products: [],
          };
        }
        const productWithQuantity = {
          ...item.product,
          quantity: item.quantity,
        };
        acc[storeId].products.push(productWithQuantity);
        return acc;
      },
      {} as { [storeId: string]: GroupedItem },
    );

    // Convert the result object to an array
    const groupedItemsArray: GroupedItem[] = Object.values(groupedItems);

    console.log(groupedItemsArray);

    try {
      let berhasil = 0;
      let gagal = 0;

      const isValid = groupedItemsArray.every((group) =>
        group.products.every((product) => {
          return (
            (product.quantity <= product.stock &&
              product.type == 'ready_stok') ||
            product.type == 'pre_order'
          );
        }),
      );

      console.log(isValid);

      if (!isValid)
        throw new HttpException(
          'some products are out of stock!',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );

      await Promise.all(
        groupedItemsArray.map(async (it) => {
          const orderDetailPyld: OrderDetailDto[] = it.products.map((p) => ({
            product_id: p.id,
            product_name: p.name,
            product_price: Number(p.price),
            quantity: p.quantity,
            total_amount: Number(p.price) * p.quantity,
          }));

          console.log(orderDetailPyld);

          await Promise.all(
            orderDetailPyld.map(async (ordr) => {
              const pro = await this.prismaService.product.findUnique({
                where: {
                  id: ordr.product_id,
                },
              });

              await this.prismaService.product.update({
                where: pro,
                data: {
                  stock: {
                    decrement: ordr.quantity,
                  },
                },
              });
            }),
          );
          const totalQty = it.products.reduce(
            (acc, item) => acc + item.quantity,
            0,
          );

          const totalAmount = it.products.reduce(
            (acc, item) => acc + Number(item.price) * item.quantity,
            0,
          );

          try {
            await this.prismaService.order.create({
              data: {
                invoice: `INV${new Date().getTime()}`,
                store_id: it.store.id,
                store_name: it.store.name,
                user_id: this.req.user.id,
                total_quantity: totalQty,
                total_amount: totalAmount,
                address_id: payload.address,
                orderDetail: {
                  createMany: {
                    data: orderDetailPyld,
                  },
                },
              },
            });
            await this.prismaService.cart.deleteMany({
              where: {
                id: {
                  in: payload.data,
                },
              },
            });
            await this.prismaService.wallet.update({
              where: wallet,
              data: {
                currency: {
                  decrement: totalPrice,
                },
              },
            });
            berhasil += 1;
          } catch (err) {
            console.log(err);
            gagal += 1;
          }
        }),
      );
      return this._success(`${berhasil} Success, ${gagal} Failed`);
    } catch (err) {
      console.log(err);
      throw new HttpException(err.response, HttpStatus.BAD_REQUEST);
    }
  }

  async userOrder(query: UserListDto) {
    const { keyword, status } = query;

    const filterQuery: {
      [key: string]: any;
    } = {};

    if (!!keyword) {
      filterQuery.OR = [
        {
          store_name: {
            contains: keyword,
          },
        },
        {
          invoice: {
            contains: keyword,
          },
        },
        {
          orderDetail: {
            some: {
              product_name: {
                contains: keyword,
              },
            },
          },
        },
      ];
    }

    if (!!status) {
      filterQuery.ship_status = status;
    }

    const orders = await this.prismaService.order.findMany({
      where: {
        ...filterQuery,
        user_id: this.req.user.id,
      },
      include: {
        orderDetail: {
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
        },
      },
      orderBy: {
        invoice: 'desc',
      },
    });

    (BigInt.prototype as any).toJSON = function () {
      return Number(this);
    };

    return this._success('success', orders);
  }

  async createSingleOrder(payload: CreateSingleOrderDto) {
    const product = await this.prismaService.product.findFirst({
      where: {
        id: payload.product_id,
      },
      include: {
        store: true,
      },
    });

    if (!product) throw new HttpException('no product found', 404);

    const address = await this.prismaService.address.findFirst({
      where: {
        id: payload.address_id,
        user_id: this.req.user.id,
      },
    });
    if (!address) throw new HttpException('no address found', 404);

    const wallet = await this.prismaService.wallet.findUnique({
      where: {
        user_id: this.req.user.id,
      },
    });

    const totalPrice = Number(product.price) * payload.quantity;

    if (!wallet) throw new HttpException('no wallet found', 404);

    if (Number(wallet.currency) < totalPrice)
      throw new HttpException(
        'you dont have enough money',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    const isValid =
      product.type == 'pre_order' ||
      (product.type == 'ready_stok' && product.stock >= payload.quantity);

    if (!isValid)
      throw new HttpException(
        'some products are out of stock!',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    const order = await this.prismaService.order.create({
      data: {
        invoice: `INV${new Date().getTime()}`,
        store_name: product.store.name,
        total_amount: Number(product.price) * payload.quantity,
        total_quantity: payload.quantity,
        store_id: product.store.id,
        address_id: address.id,
        user_id: this.req.user.id,
        orderDetail: {
          create: {
            product_name: product.name,
            product_price: Number(product.price),
            quantity: payload.quantity,
            total_amount: Number(product.price) * payload.quantity,
            product_id: product.id,
          },
        },
      },
      include: {
        orderDetail: true,
      },
    });

    await this.prismaService.product.update({
      where: product,
      data: {
        stock: {
          decrement: payload.quantity,
        },
      },
    });

    await this.prismaService.wallet.update({
      where: wallet,
      data: {
        currency: {
          decrement: totalPrice,
        },
      },
    });

    return this._success('success', order);
  }

  async getDetailOrder(id: string) {
    const order = await this.prismaService.order.findFirst({
      where: {
        id,
      },
      include: {
        address: true,
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            gender: true,
            refresh_token: true,
            provider: true,
            created_at: true,
            updated_at: true,
            last_logged_in: true,
          },
        },
        orderDetail: {
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
        },
      },
    });

    (BigInt.prototype as any).toJSON = function () {
      return Number(this);
    };

    if (!order) throw new HttpException('no order found', 404);

    return this._success('success', order);
  }

  async sellerOrder(storeId: string, query: SellerListDto) {
    const { status } = query;
    const filterQuery: {
      [key: string]: any;
    } = {};

    if (!!status) {
      filterQuery.ship_status = status;
    }
    const orders = await this.prismaService.order.findMany({
      where: {
        ...filterQuery,
        store_id: storeId,
      },
      include: {
        orderDetail: {
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
        },
      },
      orderBy: {
        invoice: 'desc',
      },
    });

    (BigInt.prototype as any).toJSON = function () {
      return Number(this);
    };

    return this._success('success', orders);
  }

  async updateStatus(id: string, payload: UpdateStatusDto) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) throw new HttpException('no order found', 404);
    if (['cancel_user', 'cancel_seller'].includes(order.ship_status))
      throw new HttpException(
        'the order is already canceled',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    if (order.ship_status == 'done')
      throw new HttpException(
        'the order has been done',
        HttpStatus.NOT_ACCEPTABLE,
      );

    await this.prismaService.order.update({
      where: order,
      data: {
        ship_status: payload.status,
      },
    });

    return this._success('success update');
  }

  // async userCancel(id: string) {
  //   const order = await this.prismaService.order.findUnique({
  //     where: {
  //       id,
  //     },
  //   });

  //   if (!order) throw new HttpException('no order found', 404);
  //   if (['cancel_user', 'cancel_seller'].includes(order.ship_status))
  //     throw new HttpException(
  //       'the order is already canceled',
  //       HttpStatus.UNPROCESSABLE_ENTITY,
  //     );

  //   if (order.ship_status == 'done')
  //     throw new HttpException(
  //       'the order has been done',
  //       HttpStatus.NOT_ACCEPTABLE,
  //     );
  // }
}
