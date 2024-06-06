import { PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class EtalaseDto {
  @IsUUID()
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  avatar: string;
}

export class CreateEtalaseDto extends PickType(EtalaseDto, [
  'name',
  'avatar',
]) {}
