import { PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';

export class StoreDto {
  @IsUUID()
  id: string;

  @IsString()
  @Length(4)
  name: string;

  @IsString()
  @Length(4)
  route: string;

  @IsString()
  avatar: string;

  @IsString()
  description: string;

  @IsString()
  location: string;
}

export class CreateStoreDto extends PickType(StoreDto, [
  'name',
  'route',
  'description',
  'location',
]) {}

export class FindAllStore extends PageRequestDto {
  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  owner: string;
}
