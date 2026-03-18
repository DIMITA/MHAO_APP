import {
  IsString,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';

// ─── Update Provider Profile DTO ──────────────────────────────────────────────

export class UpdateProviderProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Company name must be at least 2 characters' })
  @MaxLength(200, { message: 'Company name must not exceed 200 characters' })
  companyName?: string;

  @IsOptional()
  @IsArray({ message: 'Skills must be an array of strings' })
  @ArrayMinSize(1, { message: 'At least one skill is required' })
  @ArrayMaxSize(50, { message: 'Cannot have more than 50 skills' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  skills?: string[];

  @IsOptional()
  @IsArray({ message: 'Zones served must be an array of strings' })
  @ArrayMinSize(1, { message: 'At least one zone must be specified' })
  @ArrayMaxSize(100, { message: 'Cannot specify more than 100 zones' })
  @IsString({ each: true, message: 'Each zone must be a string' })
  zonesServed?: string[];

  @IsOptional()
  @IsString()
  @MinLength(20, { message: 'Description must be at least 20 characters' })
  @MaxLength(3000, { message: 'Description must not exceed 3000 characters' })
  description?: string;
}

// ─── Submit KYC DTO ───────────────────────────────────────────────────────────

export class SubmitKycDto {
  @IsString()
  @MinLength(2, { message: 'Document type must be at least 2 characters' })
  @MaxLength(100, { message: 'Document type must not exceed 100 characters' })
  documentType!: string;

  @IsString()
  @MinLength(4, { message: 'Document number must be at least 4 characters' })
  @MaxLength(100, { message: 'Document number must not exceed 100 characters' })
  documentNumber!: string;
}
