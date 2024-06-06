import { IsNumber } from 'class-validator';

export class TopupWalletDto {
  @IsNumber()
  currency: number;
}
