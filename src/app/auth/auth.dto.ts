import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Gender, Provider, Role } from '@prisma/client';
import { PickType } from '@nestjs/mapped-types';

export class AuthDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  avatar: string;

  @IsEnum(Gender)
  @IsOptional()
  gender: Gender;

  @IsEnum(Role)
  @IsOptional()
  role: Role;

  @IsString()
  @Length(8)
  password: string;

  @IsEnum(Provider)
  provider: Provider;

  @IsString()
  refresh_token: string;
}

export class RegisterDto extends PickType(AuthDto, [
  'name',
  'email',
  'password',
]) {}

export class LoginDto extends PickType(AuthDto, ['email', 'password']) {}

export class ResetPassDto extends PickType(AuthDto, ['password']) {}

export class SetAvatarDto extends PickType(AuthDto, ['avatar']) {}
