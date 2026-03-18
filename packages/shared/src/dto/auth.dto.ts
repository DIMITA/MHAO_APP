import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
  IsPhoneNumber,
  Length,
  IsJWT,
} from 'class-validator';
import { ROLES, Role } from '../constants';

// ─── Register DTO ─────────────────────────────────────────────────────────────

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password!: string;

  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(64, { message: 'First name must not exceed 64 characters' })
  firstName!: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(64, { message: 'Last name must not exceed 64 characters' })
  lastName!: string;

  @IsOptional()
  @IsEnum(ROLES, { message: 'Role must be one of: CLIENT, PROVIDER, ADMIN' })
  role?: Role = ROLES.CLIENT;
}

// ─── Login DTO ────────────────────────────────────────────────────────────────

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password!: string;
}

// ─── Send OTP DTO ─────────────────────────────────────────────────────────────

export class SendOtpDto {
  @IsString()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone!: string;
}

// ─── Verify OTP DTO ───────────────────────────────────────────────────────────

export class VerifyOtpDto {
  @IsString()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone!: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp!: string;
}

// ─── Refresh Token DTO ────────────────────────────────────────────────────────

export class RefreshTokenDto {
  @IsString()
  @IsJWT({ message: 'Invalid refresh token format' })
  refreshToken!: string;
}

// ─── JWT Payload DTO ──────────────────────────────────────────────────────────

export class JwtPayloadDto {
  @IsString()
  sub!: string;

  @IsEmail()
  email!: string;

  @IsEnum(ROLES, { message: 'Role must be one of: CLIENT, PROVIDER, ADMIN' })
  role!: Role;
}
