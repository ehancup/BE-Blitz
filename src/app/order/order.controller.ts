import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/role.reflector';
import {
  CreateOrderDto,
  CreateSingleOrderDto,
  SellerListDto,
  UpdateStatusDto,
  UserListDto,
} from './order.dto';
import { OrderService } from './order.service';
import { OwnerGuard } from 'src/guard/owner/owner.guard';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['seller', 'user'])
  @Post('/create')
  createOrder(@Body() payload: CreateOrderDto) {
    return this.orderService.createOrder(payload);
  }
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['seller', 'user'])
  @Post('/create-single')
  createSingleOrder(@Body() payload: CreateSingleOrderDto) {
    return this.orderService.createSingleOrder(payload);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['seller', 'user'])
  @Get('/user-list')
  userList(@Query() query: UserListDto) {
    return this.orderService.userOrder(query);
  }

  @Get('/detail/:id')
  getDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.getDetailOrder(id);
  }

  @UseGuards(JwtGuard, RoleGuard, OwnerGuard)
  @Roles(['seller'])
  @Get('/seller-list/:id')
  listSeller(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: SellerListDto,
  ) {
    return this.orderService.sellerOrder(id, query);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['seller', 'user'])
  @Put('/set-status/:id')
  setStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateStatusDto,
  ) {
    return this.orderService.updateStatus(id, payload);
  }
}
