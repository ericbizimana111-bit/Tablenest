import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const;

export class CreateRestaurantDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  cuisineType: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(1)
  seatingCapacity: number;

  @IsOptional()
  @IsIn(PRICE_RANGES)
  priceRange?: string;

  @IsString()
  @MinLength(1)
  address: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  dineIn?: boolean;

  @IsOptional()
  @IsBoolean()
  delivery?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  logo?: string | null;
}

export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  cuisineType?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  seatingCapacity?: number;

  @IsOptional()
  @IsIn(PRICE_RANGES)
  priceRange?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  dineIn?: boolean;

  @IsOptional()
  @IsBoolean()
  delivery?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  logo?: string | null;
}
