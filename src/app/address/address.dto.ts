import { OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';

export class AddressDto {
  @IsString()
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  @Length(8)
  phone_number: string;

  @IsString()
  note: string;

  @IsString()
  @IsUUID()
  user_id: string;
}

export class CreateAddressDto extends OmitType(AddressDto, ['id', 'user_id']) {}
export class UpdateAddressDto extends OmitType(AddressDto, ['id', 'user_id']) {}

export class FindAddressDto extends PageRequestDto {
  @IsOptional()
  @IsString()
  keyword: string;
}
