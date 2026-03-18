import {
  IsString,
  IsNumber,
  IsEnum,
  IsUUID,
  IsPositive,
  IsInt,
  Min,
  MinLength,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MOBILE_MONEY_PROVIDERS, MobileMoneyProvider } from '../constants';

// ─── Initiate Payment DTO ─────────────────────────────────────────────────────

export class InitiatePaymentDto {
  @IsUUID('4', { message: 'projectId must be a valid UUID' })
  projectId!: string;

  @IsUUID('4', { message: 'quoteId must be a valid UUID' })
  quoteId!: string;

  @IsString()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phoneNumber!: string;

  @IsEnum(MOBILE_MONEY_PROVIDERS, {
    message: 'Provider must be one of: MTN, ORANGE, MOOV',
  })
  provider!: MobileMoneyProvider;

  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  @Type(() => Number)
  amount!: number;
}

// ─── Milestone DTO ────────────────────────────────────────────────────────────

export class MilestoneDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title!: string;

  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description!: string;

  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  @Type(() => Number)
  amount!: number;

  @IsInt({ message: 'Order must be an integer' })
  @Min(1, { message: 'Order must be at least 1' })
  @Type(() => Number)
  order!: number;
}

// ─── Release Milestone DTO ────────────────────────────────────────────────────

export class ReleaseMilestoneDto {
  @IsUUID('4', { message: 'paymentId must be a valid UUID' })
  paymentId!: string;

  @IsUUID('4', { message: 'milestoneId must be a valid UUID' })
  milestoneId!: string;
}
