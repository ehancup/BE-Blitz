import { IsArray, IsNumber, IsString } from 'class-validator';

export class AddToCartDto {
  @IsNumber()
  quantity: number;
}

export class UpdateQtyDto extends AddToCartDto {}

export class AmountDto {
  @IsArray({})
  @IsString({ each: true, message: 'Each tag must be a string' })
  id: string[];
}
