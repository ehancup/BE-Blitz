import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/role.reflector';
import { CreateOrderDto } from './order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['seller', 'user'])
  @Get('/test')
  test(@Body() payload: CreateOrderDto) {
    return this.orderService.createOrder(payload);
  }
}
