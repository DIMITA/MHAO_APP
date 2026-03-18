import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '@prisma/client';

export class ProjectFilterDto {
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lng?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  radius?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  budgetMin?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  budgetMax?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
