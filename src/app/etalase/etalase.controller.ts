import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EtalaseService } from './etalase.service';
import { CreateEtalaseDto } from './etalase.dto';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { OwnerGuard } from 'src/guard/owner/owner.guard';
import { Roles } from 'src/guard/role/role.reflector';

@Controller('etalase')
export class EtalaseController {
  constructor(private etalaseService: EtalaseService) {}
  @Get('/list/:route')
  listEtalase(@Param('route') route: string) {
    return this.etalaseService.listStoreEtalase(route);
  }

  @UseGuards(JwtGuard, RoleGuard, OwnerGuard)
  @Roles(['seller'])
  @Post('/create/:id')
  createEtalase(@Param('id') id: string, @Body() payload: CreateEtalaseDto) {
    return this.etalaseService.addEtalase(id, payload);
  }
}
