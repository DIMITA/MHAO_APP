import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsUrl,
  IsUUID,
  IsPositive,
  IsInt,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Create Quote DTO ─────────────────────────────────────────────────────────

export class CreateQuoteDto {
  @IsUUID('4', { message: 'projectId must be a valid UUID' })
  projectId!: string;

  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  @Type(() => Number)
  amount!: number;

  @IsString()
  @MinLength(20, { message: 'Description must be at least 20 characters' })
  @MaxLength(3000, { message: 'Description must not exceed 3000 characters' })
  description!: string;

  @IsInt({ message: 'Timeline days must be an integer' })
  @Min(1, { message: 'Timeline must be at least 1 day' })
  @Type(() => Number)
  timelineDays!: number;

  @IsOptional()
  @IsArray({ message: 'Files must be an array of URLs' })
  @IsUrl({}, { each: true, message: 'Each file must be a valid URL' })
  files?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;
}

// ─── Update Quote DTO ─────────────────────────────────────────────────────────

export class UpdateQuoteDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(3000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  timelineDays?: number;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  files?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
