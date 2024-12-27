import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { IsString, IsUUID } from 'class-validator';

class Room {
  @IsString()
  @IsUUID()
  id: string;
}

@WebSocketGateway({
  //? 0 means same port as nest port
  cors: {
    origin: process.env.FRONT_HOST,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    Logger.verbose(`Client Connected : ${client.id}`, 'Socket');
    this.server.emit('recieve_message', 'welcome you');
    const clients = Array.from(this.server.sockets.sockets.keys());
    console.log(clients);
  }

  async handleDisconnect(client: Socket) {
    Logger.fatal(`Client Disconnected : ${client.id}`, 'Socket');
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(socket: Socket, payload: any) {
    console.log('join room');
    socket.join(payload.id);
    Logger.verbose(`Client (${socket.id}) joined => ${payload.id}`, 'Socket');

    const people = Array.from(
      this.server.sockets.adapter.rooms.get(payload.id),
    );
    console.log('people online => ', people);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(socket: Socket, payload: any) {
    console.log('leave room');
    // socket.leave(payload.id);
    const roomClients = this.server.sockets.adapter.rooms.get(payload.id);

    if (roomClients && roomClients.has(socket.id)) {
      socket.leave(payload.id);
      Logger.fatal(`Client (${socket.id}) leave => ${payload.id}`, 'Socket');
      const people = Array.from(
        this.server.sockets.adapter.rooms.get(payload.id),
      );
      console.log('people online => ', people);
    }
  }

  @SubscribeMessage('user_send')
  handleUserSend(socket: Socket, { room, id }: { room: string; id: string }) {
    console.log('user send');
    Logger.verbose(`Client (${socket.id}) send =to=> ${room}`);
    socket.broadcast.emit('store_notif', id);
    socket.to(room).emit('store_recieve', 'new message');
  }

  @SubscribeMessage('store_send')
  handleStoreSend(socket: Socket, { room, id }: { room: string; id: string }) {
    console.log('store send');
    console.log('payload store', { room, id });
    Logger.verbose(`Client Store (${socket.id}) send =to=> ${room}`);
    socket.broadcast.emit('user_notif', id);
    socket.to(room).emit('user_recieve', 'new message');
  }
  // @SubscribeMessage('connection')
  // handleConnect(socket: Socket) {
  //   socket.on('user_send', ({ room, id }: { room: string; id: string }) => {
  //     console.log('user send');
  //     socket.broadcast.emit('store_notif', id);
  //     socket.to(room).emit('store_recieve', 'new message');
  //   });
  //   socket.on('store_send', ({ room, id }: { room: string; id: string }) => {
  //     console.log('store send');
  //     socket.broadcast.emit('user_notif', id);
  //     socket.to(room).emit('user_recieve', 'new message');
  //   });
  // }
}
