import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsEnum,
  IsUUID,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  Min,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MobileMoneyProviderEnum {
  MTN = 'MTN',
  ORANGE = 'ORANGE',
  MOOV = 'MOOV',
}

export class MilestoneDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  order: number;
}

export class InitiatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsUUID()
  @IsNotEmpty()
  quoteId: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsEnum(MobileMoneyProviderEnum)
  provider: MobileMoneyProviderEnum;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones: MilestoneDto[];
}
