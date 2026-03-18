import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  IsUrl,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsPositive,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PROJECT_STATUS, ProjectStatus, PAGINATION } from '../constants';

// ─── Create Project DTO ───────────────────────────────────────────────────────

export class CreateProjectDto {
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title!: string;

  @IsString()
  @MinLength(20, { message: 'Description must be at least 20 characters' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description!: string;

  @IsNumber({}, { message: 'Minimum budget must be a number' })
  @IsPositive({ message: 'Minimum budget must be a positive number' })
  @Type(() => Number)
  budgetMin!: number;

  @IsNumber({}, { message: 'Maximum budget must be a number' })
  @IsPositive({ message: 'Maximum budget must be a positive number' })
  @Type(() => Number)
  budgetMax!: number;

  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  @Type(() => Number)
  lat!: number;

  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  @Type(() => Number)
  lng!: number;

  @IsString()
  @MinLength(5, { message: 'Address must be at least 5 characters' })
  @MaxLength(500, { message: 'Address must not exceed 500 characters' })
  address!: string;

  @IsString()
  @MinLength(2, { message: 'Category must be at least 2 characters' })
  @MaxLength(100, { message: 'Category must not exceed 100 characters' })
  category!: string;

  @IsOptional()
  @IsArray({ message: 'Photos must be an array of URLs' })
  @IsUrl({}, { each: true, message: 'Each photo must be a valid URL' })
  photos?: string[];
}

// ─── Update Project DTO ───────────────────────────────────────────────────────

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  budgetMin?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  budgetMax?: number;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  lng?: number;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  photos?: string[];

  @IsOptional()
  @IsEnum(PROJECT_STATUS, {
    message: 'Status must be one of: OPEN, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED',
  })
  status?: ProjectStatus;
}

// ─── Project Filter DTO ───────────────────────────────────────────────────────

export class ProjectFilterDto {
  @IsOptional()
  @IsEnum(PROJECT_STATUS, { message: 'Invalid project status' })
  status?: ProjectStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  lng?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Radius must be a positive number (in km)' })
  @Max(500, { message: 'Radius must not exceed 500 km' })
  @Type(() => Number)
  radius?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  budgetMin?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  budgetMax?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = PAGINATION.DEFAULT_PAGE;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(PAGINATION.MAX_LIMIT)
  @Type(() => Number)
  limit?: number = PAGINATION.DEFAULT_LIMIT;
}
