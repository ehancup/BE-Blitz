import { IsString } from 'class-validator';

export class UserSendDto {
  @IsString()
  message: string;
}

export class StoreSendDto extends UserSendDto {}
