import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { OrderType } from '@prisma/client';
import { Type } from 'class-transformer';
import { PickType } from '@nestjs/mapped-types';
import { PageRequestDto } from 'src/utils/dto/page.dto';
// import { CategoryDto } from '../category/category.dto';

export class ProductDto {
  @IsUUID()
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsEnum(OrderType)
  type: OrderType;

  @IsNumber()
  stock: number;

  @IsString()
  etalase_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageProductDto)
  image: ImageProductDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductCategory)
  category: ProductCategory[];
}

export class ImageProductDto {
  // @IsUUID()
  // @IsString()
  // id: string;

  @IsString()
  image: string;
}

export class ProductCategory {
  @IsUUID()
  @IsString()
  id: string;
}

export class UpdateProductDto extends PickType(ProductDto, [
  'name',
  'price',
  'stock',
  'description',
  'etalase_id',
  'type',
]) {}

export class CreateProductDto extends PickType(ProductDto, [
  'name',
  'description',
  'etalase_id',
  'image',
  'price',
  'stock',
  'category',
  'type',
]) {}

export class FindAllProductDto extends PageRequestDto {
  @IsOptional()
  @IsString()
  store: string;

  @IsOptional()
  @IsUUID()
  @IsString()
  etalase_id: string;

  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsNumber()
  from_price: number;

  @IsOptional()
  @IsNumber()
  to_price: number;

  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @IsEnum(OrderType)
  type: string;
}
