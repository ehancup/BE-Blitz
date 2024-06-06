import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateProductDto,
  FindAllProductDto,
  UpdateProductDto,
} from './product.dto';
import BaseResponse from 'src/utils/response/base.response';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductService extends BaseResponse {
  constructor(
    private prismaService: PrismaService,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      // Pilih indeks secara acak dari 0 hingga i
      const j = Math.floor(Math.random() * (i + 1));
      // Tukar elemen array[i] dengan array[j]
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async createProduct(storeId: string, payload: CreateProductDto) {
    const { image, category, etalase_id, ...pyld } = payload;

    const catid: { category_id: string }[] = category.map((e) => ({
      category_id: e.id,
    }));
    const store = await this.prismaService.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!store) throw new HttpException('no store found', HttpStatus.NOT_FOUND);

    const etalase = await this.prismaService.etalase.findUnique({
      where: {
        id: etalase_id,
        store_id: storeId,
      },
    });

    if (!etalase)
      throw new HttpException('invalid etalase', HttpStatus.NOT_FOUND);

    const product = await this.prismaService.product.create({
      data: {
        ...pyld,
        store: {
          connect: store,
        },
        image: {
          create: image,
        },
        categoryToProduct: {
          createMany: {
            data: catid,
          },
        },
        etalase: {
          connect: etalase,
        },
      },
      //   include: {
      //     etalase: true,
      //     categoryToProduct: {
      //       include: {
      //         category: true,
      //       },
      //     },
      //     image: true,
      //     store: true,
      //   },
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
        stock: true,
        image: {
          select: {
            id: true,
            image: true,
          },
        },
        categoryToProduct: {
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        etalase: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    (BigInt.prototype as any).toJSON = function () {
      return Number(this);
    };

    return this._success('product successfully created', product);
  }

  async findProduct(query: FindAllProductDto) {
    const {
      category,
      etalase_id,
      from_price,
      keyword,
      limit,
      page,
      pageSize,
      store,
      to_price,
      type,
    } = query;

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

    if (!keyword && !!category) {
      filterQuery.categoryToProduct = {
        some: {
          category: {
            name: {
              contains: category,
            },
          },
        },
      };
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

    if (!!store) {
      const foundStore = await this.prismaService.store.findFirst({
        where: {
          OR: [{ route: store }, { id: store }],
        },
      });

      if (!foundStore) {
        throw new HttpException('no store found', HttpStatus.NOT_FOUND);
      } else {
        filterQuery.store = {
          route: foundStore.route,
        };

        if (!!etalase_id) {
          const etalase = await this.prismaService.etalase.findUnique({
            where: {
              id: etalase_id,
              store: foundStore,
            },
          });

          if (!etalase) {
            throw new HttpException('invalid etalase', HttpStatus.NOT_FOUND);
          } else {
            filterQuery.etalase = {
              id: etalase_id,
            };
          }
        }
      }
    }

    const total = await this.prismaService.product.count({
      where: filterQuery,
    });

    const products = await this.prismaService.product.findMany({
      where: filterQuery,
      skip: limit,
      take: pageSize,
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
    });

    (BigInt.prototype as any).toJSON = function () {
      return Number(this);
    };

    return this._pagination('success', products, total, page, pageSize);
  }

  async getDetailProduct(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: {
        categoryToProduct: {
          include: {
            category: true,
          },
        },
        image: {
          orderBy: {
            image: 'asc',
          },
        },
        store: true,
        etalase: true,
        _count: true,
      },
    });

    if (!product) throw new HttpException('no product found', 404);

    (BigInt.prototype as any).toJSON = function () {
      return Number(this);
    };

    // let isWishlisted = false;

    // if (!!this.req.user) {
    //   const wishlisted = await this.prismaService.wishlist.findFirst({
    //     where: {
    //       user_id: this.req.user.id,
    //       product_id: product.id,
    //     },
    //   });

    //   if (!!wishlisted) {
    //     isWishlisted = true;
    //   } else {
    //     isWishlisted = false;
    //   }
    // } else {
    //   isWishlisted = false;
    // }

    return this._success('success', {
      ...product,
      // isWishlisted,
    });
  }

  async generateRandProduct() {
    const products = await this.prismaService.product.findMany({
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
    });

    (BigInt.prototype as any).toJSON = function () {
      return Number(this);
    };

    const newest = this.shuffleArray(products);
    const newest2 = newest.filter((_, i) => i < 12);

    return this._success('success', newest2);
  }

  async deleteImageProduct(imageId: string) {
    const image = await this.prismaService.productImage.findUnique({
      where: {
        id: imageId,
      },
    });

    if (!image) throw new HttpException('no image found', 404);

    const filename = image.image.split('/').pop();

    try {
      const filePath = `/public/uploads/${filename}`;
      // console.log(filePath);
      const pathName = path.join(__dirname, '../../..', filePath);
      // console.log(pathName);
      fs.unlinkSync(pathName);
    } catch (err) {
      console.log(err);
    }

    await this.prismaService.productImage.delete({
      where: image,
    });
    return this._success('Berhasil menghapus photo');
  }

  async updateProduct(id: string, payload: UpdateProductDto) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) throw new HttpException('no product found', 404);

    await this.prismaService.product.update({
      where: product,
      data: payload,
    });

    return this._success('success update');
  }

  async deleteProduct(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: {
        image: true,
      },
    });

    if (!product) throw new HttpException('no product found', 404);

    product.image.map((image) => {
      const filename = image.image.split('/').pop();
      try {
        const filePath = `/public/uploads/${filename}`;
        // console.log(filePath);
        const pathName = path.join(__dirname, '../../..', filePath);
        // console.log(pathName);
        fs.unlinkSync(pathName);
      } catch (err) {
        console.log(err);
      }
    });

    await this.prismaService.product.delete({
      where: {
        id: product.id,
      },
    });

    return this._success('success delete');
  }
}
