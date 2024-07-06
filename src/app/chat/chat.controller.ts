import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/role.reflector';
import { OwnerGuard } from 'src/guard/owner/owner.guard';
import { StoreSendDto, UserSendDto } from './chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user', 'seller'])
  @Get('/user-room')
  getUserRoom() {
    return this.chatService.getAllUserRoom();
  }

  @UseGuards(JwtGuard, RoleGuard, OwnerGuard)
  @Roles(['seller'])
  @Get('/store-room/:id')
  getStoreRoom(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.getStoreRoom(id);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user', 'seller'])
  @Get('/user-chat/:room')
  getUserChat(@Param('room', ParseUUIDPipe) room: string) {
    return this.chatService.getUserChat(room);
  }

  @UseGuards(JwtGuard, RoleGuard, OwnerGuard)
  @Roles(['seller'])
  @Get('/store-chat/:id/:room')
  getStoreChat(
    @Param('room', ParseUUIDPipe) room: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chatService.getStoreChat(room, id);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user', 'seller'])
  @Post('/user-create-room/:store')
  userCreateRoom(@Param('store', ParseUUIDPipe) store: string) {
    return this.chatService.createUserRoom(store);
  }

  @UseGuards(JwtGuard, RoleGuard, OwnerGuard)
  @Roles(['seller'])
  @Post('/store-create-room/:id/:userId')
  createStoreRoom(
    @Param('id', ParseUUIDPipe) storeId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.chatService.createStoreRoom(storeId, userId);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['seller', 'user'])
  @Post('/user-send/:room')
  userSend(
    @Param('room', ParseUUIDPipe) roomId: string,
    @Body() payload: UserSendDto,
  ) {
    return this.chatService.userSend(payload, roomId);
  }

  @UseGuards(JwtGuard, RoleGuard, OwnerGuard)
  @Roles(['seller'])
  @Post('/store-send/:id/:room')
  storeSend(
    @Body() payload: StoreSendDto,
    @Param('room', ParseUUIDPipe) roomId: string,
  ) {
    return this.chatService.storeSend(payload, roomId);
  }

  @Get('/room-detail/:room')
  roomDetail(@Param('room', ParseUUIDPipe) roomId: string) {
    return this.chatService.getDetailRoom(roomId);
  }
}
