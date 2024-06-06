import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/role.reflector';
import { FindAllWishlist } from './wishlist.dto';
import { Pagination } from 'src/utils/decorators/page/page.decorator';

@UseGuards(JwtGuard, RoleGuard)
@Roles(['user', 'seller'])
@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Post('/add/:id')
  addWishlist(@Param('id', ParseUUIDPipe) productId: string) {
    return this.wishlistService.addToWishlist(productId);
  }

  @Get('/my-list')
  list(@Pagination() query: FindAllWishlist) {
    return this.wishlistService.listWishllist(query);
  }

  @Delete('/delete/:id')
  delete(@Param('id', ParseUUIDPipe) wishId: string) {
    return this.wishlistService.deleteWishlist(wishId);
  }
}
