import { OrderType } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';

export class FindAllWishlist extends PageRequestDto {
  @IsOptional()
  @IsNumber()
  from_price: number;

  @IsOptional()
  @IsNumber()
  to_price: number;

  @IsOptional()
  @IsEnum(OrderType)
  type: string;

  @IsOptional()
  @IsString()
  keyword: string;
}
