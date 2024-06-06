import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/role.reflector';
import { TopupWalletDto } from './wallet.dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['seller', 'user'])
  @Post('/topup')
  topup(@Body() payload: TopupWalletDto) {
    return this.walletService.topup(payload);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user', 'seller'])
  @Get('/my-wallet')
  mywallet() {
    return this.walletService.myWallet();
  }
}
