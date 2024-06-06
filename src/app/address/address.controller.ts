import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/role.reflector';
import {
  CreateAddressDto,
  FindAddressDto,
  UpdateAddressDto,
} from './address.dto';
import { Pagination } from 'src/utils/decorators/page/page.decorator';

@Controller('address')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user', 'seller'])
  @Post('/create')
  createAddress(@Body() payload: CreateAddressDto) {
    return this.addressService.createAddress(payload);
  }

  @Get('/all-address')
  allAdress() {
    return this.addressService.getAllAddress();
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user', 'seller'])
  @Get('/my-address')
  myAddress(@Pagination() query: FindAddressDto) {
    return this.addressService.getMyAddress(query);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user', 'seller'])
  @Delete('/del-my-address/:id')
  deleteMine(@Param('id', ParseUUIDPipe) id: string) {
    return this.addressService.deleteMyAddress(id);
  }

  @Get('/detail/:id')
  getDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.addressService.getDetailAddress(id);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user', 'seller'])
  @Put('/update/:id')
  updateAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateAddressDto,
  ) {
    return this.addressService.updateAddress(id, payload);
  }
}
