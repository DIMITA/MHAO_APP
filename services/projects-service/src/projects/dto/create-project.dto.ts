import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budgetMin: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budgetMax: number;

  @IsNumber()
  @Type(() => Number)
  lat: number;

  @IsNumber()
  @Type(() => Number)
  lng: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsArray()
  @IsOptional()
  photos?: string[];
}
