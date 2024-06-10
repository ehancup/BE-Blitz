import { PickType } from '@nestjs/mapped-types';
import { ShipStatus } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  @IsString({ each: true })
  data: string[];

  @IsString()
  address: string;
}

export class OrderDetailDto {
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  total_amount: number;
}

export class UserListDto {
  @IsOptional()
  @IsString()
  keyword: string;

  // @IsEnum(ShipStatus)
  @IsOptional()
  status: ShipStatus;
}

export class SellerListDto extends PickType(UserListDto, ['status']) {}

export class CreateSingleOrderDto {
  @IsString()
  @IsUUID()
  product_id: string;
  @IsString()
  @IsUUID()
  address_id: string;

  @IsNumber()
  quantity: number;
}

export class UpdateStatusDto {
  @IsEnum(ShipStatus)
  status: ShipStatus;
}
