import { IsString } from 'class-validator';

export class LogoutDto {
  @IsString()
  userId: string;

  @IsString()
  jti: string;

  @IsString()
  accessToken: string;
}
