import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Create Review DTO ────────────────────────────────────────────────────────

export class CreateReviewDto {
  @IsUUID('4', { message: 'projectId must be a valid UUID' })
  projectId!: string;

  @IsUUID('4', { message: 'revieweeId must be a valid UUID' })
  revieweeId!: string;

  @IsNumber({}, { message: 'Rating must be a number' })
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must not exceed 5' })
  @Type(() => Number)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters' })
  comment?: string;
}
