import { IsArray, IsString } from 'class-validator';

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
