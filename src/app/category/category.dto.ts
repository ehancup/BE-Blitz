import { PickType } from '@nestjs/mapped-types';
import { IsString, IsUUID } from 'class-validator';

export class CategoryDto {
  @IsUUID()
  @IsString()
  id: string;

  @IsString()
  name: string;
}

export class CreateCategoryDto extends PickType(CategoryDto, ['name']) {}
