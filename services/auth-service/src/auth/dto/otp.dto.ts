import { IsString, IsPhoneNumber, Length } from 'class-validator';

export class SendOtpDto {
  @IsString()
  phone: string;
}

export class VerifyOtpDto {
  @IsString()
  phone: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}
