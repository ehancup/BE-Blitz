import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto, FindAllStore } from './store.dto';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/role.reflector';
import { Pagination } from 'src/utils/decorators/page/page.decorator';
import { OwnerGuard } from 'src/guard/owner/owner.guard';

@Controller('store')
export class StoreController {
  constructor(private storeService: StoreService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['seller'])
  @Post('/create')
  createStore(@Body() payload: CreateStoreDto) {
    return this.storeService.createStore(payload);
  }

  @Get('/list')
  findAll(@Pagination() query: FindAllStore) {
    return this.storeService.findAll(query);
  }

  @UseGuards(JwtGuard, RoleGuard, OwnerGuard)
  @Roles(['seller', 'admin'])
  @Delete('/delete/:id')
  deleteStore(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory(errors) {
          return new HttpException(
            `testing error : ${errors}`,
            HttpStatus.BAD_REQUEST,
          );
        },
      }),
    )
    id: string,
  ) {
    return this.storeService.deleteStore(id);
  }

  @Get('/detail/:route')
  detailStore(@Param('route') route: string) {
    return this.storeService.getDetail(route);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['seller'])
  @Get('/owner')
  getOwnerStore() {
    return this.storeService.getOwnerStore();
  }
}
