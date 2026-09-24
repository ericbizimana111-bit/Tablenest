import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const;

export class CreateRestaurantDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  cuisineType: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsNumber()
  @Min(1)
  @Max(2000)
  seatingCapacity: number;

  @IsOptional()
  @IsIn(PRICE_RANGES)
  priceRange?: string;

  @IsString()
  @MinLength(3)
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
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsBoolean()
  dineIn?: boolean;

  @IsOptional()
  @IsBoolean()
  delivery?: boolean;

  @IsOptional()
  @IsBoolean()
  pickup?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrder?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.4)
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(5)
  prepTime?: number;

  @IsOptional()
  @IsObject()
  openingHours?: Record<string, { open: string; close: string; closed: boolean }>;

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
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  cuisineType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(2000)
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
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsBoolean()
  dineIn?: boolean;

  @IsOptional()
  @IsBoolean()
  delivery?: boolean;

  @IsOptional()
  @IsBoolean()
  pickup?: boolean;

  @IsOptional()
  @IsBoolean()
  acceptingOrders?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrder?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.4)
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(5)
  prepTime?: number;

  @IsOptional()
  @IsObject()
  openingHours?: Record<string, { open: string; close: string; closed: boolean }>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  logo?: string | null;
}
