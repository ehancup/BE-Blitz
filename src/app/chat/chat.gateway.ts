import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway(0, {
  //? 0 means same port as nest port
  cors: {
    origin: process.env.FRONT_HOST,
  },
})
export class ChatGateway {
  @SubscribeMessage('connection')
  handleConnection(socket: Socket) {
    console.log(socket.id);
    socket.emit('recieve_message', 'welcome you');
    socket.broadcast.emit('recieve_message', 'someone is online');

    socket.on('join_room', (e: string) => {
      socket.join(e);
      console.log('joined', e);
    });

    socket.on('leave_room', (e: string) => {
      socket.leave(e);
      console.log('you exit the previous room', e);
    });

    socket.on('user_send', ({ room, id }: { room: string; id: string }) => {
      console.log('user send');
      socket.broadcast.emit('store_notif', id);
      socket.to(room).emit('store_recieve', 'new message');
    });
    socket.on('store_send', ({ room, id }: { room: string; id: string }) => {
      console.log('store send');
      socket.broadcast.emit('user_notif', id);
      socket.to(room).emit('user_recieve', 'new message');
    });

    socket.on('disconnect', () => {
      socket.broadcast.emit('recieve_message', 'someone is AFK');
    });
  }
}
