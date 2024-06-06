import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/role.reflector';
import { AddToCartDto, AmountDto, UpdateQtyDto } from './cart.dto';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user', 'seller'])
  @Post('/add/:productId')
  add(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() payload: AddToCartDto,
  ) {
    return this.cartService.addToCart(payload, productId);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user', 'seller'])
  @Get('/my-cart')
  myCart() {
    return this.cartService.myCart();
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user', 'seller'])
  @Put('/update-qty/:id')
  updateQty(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateQtyDto,
  ) {
    return this.cartService.updateQty(id, payload);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user', 'seller'])
  @Post('/get-amount')
  getAmount(@Body() payload: AmountDto) {
    return this.cartService.getTotalAmount(payload);
  }
}
