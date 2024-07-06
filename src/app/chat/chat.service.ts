import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/response/base.response';
import { StoreSendDto, UserSendDto } from './chat.dto';

@Injectable()
export class ChatService extends BaseResponse {
  constructor(
    private prismaService: PrismaService,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async getAllUserRoom() {
    const userRoom = await this.prismaService.chatRoom.findMany({
      where: {
        user_id: this.req.user.id,
      },
      include: {
        chats: {
          select: {
            message: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
        },
        store: true,
        _count: {
          select: {
            chats: {
              where: {
                sender: 'seller',
                is_read: false,
              },
            },
          },
        },
      },
      // orderBy: {
      //   Chat: {
      //     created_at: 'desc',
      //   },
      // },
    });

    const sortedChatRooms = userRoom
      .filter((room) => room.chats.length > 0)
      .sort((a, b) => {
        const aChat = a.chats[0]?.created_at ?? new Date(0);
        const bChat = b.chats[0]?.created_at ?? new Date(0);
        return bChat.getTime() - aChat.getTime();
      });

    return this._success('success', sortedChatRooms);
  }

  async getStoreRoom(storeId: string) {
    const sellerRoom = await this.prismaService.chatRoom.findMany({
      where: {
        store_id: storeId,
      },
      include: {
        chats: {
          select: {
            message: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            chats: {
              where: {
                sender: 'user',
                is_read: false,
              },
            },
          },
        },
      },
    });

    const sortedChatRooms = sellerRoom
      .filter((room) => room.chats.length > 0)
      .sort((a, b) => {
        const aChat = a.chats[0]?.created_at ?? new Date(0);
        const bChat = b.chats[0]?.created_at ?? new Date(0);
        return bChat.getTime() - aChat.getTime();
      });

    return this._success('success', sortedChatRooms);
  }

  async getUserChat(roomID: string) {
    const room = await this.prismaService.chatRoom.findFirst({
      where: {
        user_id: this.req.user.id,
        id: roomID,
      },
    });

    if (!room) throw new HttpException('no room found', 404);
    const chat = await this.prismaService.chat.findMany({
      where: {
        room,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return this._success('success', chat);
  }

  async getStoreChat(roomId: string, storeId: string) {
    const room = await this.prismaService.chatRoom.findFirst({
      where: {
        store_id: storeId,
        id: roomId,
      },
    });

    if (!room) throw new HttpException('no room found', 404);

    const chat = await this.prismaService.chat.findMany({
      where: {
        room,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return this._success('success', chat);
  }

  async createUserRoom(storeId: string) {
    const store = await this.prismaService.store.findFirst({
      where: {
        id: storeId,
      },
    });
    if (!store) throw new HttpException('no store found', 404);
    const existingRoom = await this.prismaService.chatRoom.findFirst({
      where: {
        user_id: this.req.user.id,
        store,
      },
    });

    if (!!existingRoom)
      return this._success('already room exist', existingRoom);

    const data = await this.prismaService.chatRoom.create({
      data: {
        user_id: this.req.user.id,
        store_id: store.id,
      },
    });

    return this._success('success create room', data);
  }

  async createStoreRoom(storeId: string, userId: string) {
    const store = await this.prismaService.store.findFirst({
      where: {
        id: storeId,
      },
    });
    if (!store) throw new HttpException('no store found', 404);

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new HttpException('no user found', 404);

    const existingRoom = await this.prismaService.chatRoom.findFirst({
      where: {
        user,
        store,
      },
    });

    if (!!existingRoom)
      throw new HttpException(
        'already room with this user',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    const data = await this.prismaService.chatRoom.create({
      data: {
        user: {
          connect: user,
        },
        store: {
          connect: store,
        },
      },
    });

    return this._success('success create store room', data);
  }

  async userSend(payload: UserSendDto, roomId: string) {
    const room = await this.prismaService.chatRoom.findUnique({
      where: {
        id: roomId,
        user_id: this.req.user.id,
      },
    });

    if (!room) throw new HttpException('no room found', 404);

    const data = await this.prismaService.chat.create({
      data: {
        message: payload.message,
        sender: 'user',
        room: {
          connect: room,
        },
      },
    });

    return this._success('success send', data);
  }

  async storeSend(payload: StoreSendDto, roomId: string) {
    const room = await this.prismaService.chatRoom.findUnique({
      where: {
        id: roomId,
      },
      include: {
        store: true,
      },
    });

    if (!room) throw new HttpException('no room found', 404);

    if (room.store.user_id != this.req.user.id)
      throw new HttpException(
        'youre not the owner',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    const data = await this.prismaService.chat.create({
      data: {
        message: payload.message,
        sender: 'seller',
        room: {
          connect: room,
        },
      },
    });

    return this._success('success', data);
  }

  async getDetailRoom(roomId: string) {
    const room = await this.prismaService.chatRoom.findUnique({
      where: {
        id: roomId,
      },
      include: {
        store: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            email: true,
          },
        },
      },
    });

    if (!room) throw new HttpException('no room found', 404);

    return this._success('success', room);
  }
}
