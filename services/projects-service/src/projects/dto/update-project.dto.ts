import { IsString, IsNumber, IsOptional, IsArray, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '@prisma/client';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  budgetMin?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  budgetMax?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lng?: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsArray()
  @IsOptional()
  photos?: string[];

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;
}
