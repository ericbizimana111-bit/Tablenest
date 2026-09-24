import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { EmptyToNull, IMAGE_URL_RE, IsTimeZone, IsWeeklyHours, Trim } from '../../../common/validation/validators';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const;

export class CreateRestaurantDto {
  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  cuisineType: string;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2000)
  seatingCapacity: number;

  @IsOptional()
  @IsIn(PRICE_RANGES)
  priceRange?: string;

  @Trim()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  address: string;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(80)
  city?: string | null;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(80)
  country?: string | null;

  @IsOptional()
  @EmptyToNull()
  @Matches(/^\+?[\d\s()-]{6,20}$/, { message: 'Enter a valid phone number' })
  phone?: string | null;

  @IsOptional()
  @EmptyToNull()
  @IsEmail({}, { message: 'Enter a valid email address' })
  email?: string | null;

  @IsOptional()
  @EmptyToNull()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'Website must start with http:// or https://' })
  website?: string | null;

  @IsOptional()
  @IsTimeZone()
  timezone?: string;

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
  @IsInt()
  @Min(5)
  @Max(240)
  prepTime?: number;

  @IsOptional()
  @IsWeeklyHours()
  openingHours?: Record<string, { open: string; close: string; closed: boolean }>;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @Matches(IMAGE_URL_RE, { each: true, message: 'Each image must be an uploaded image URL' })
  images?: string[];

  @IsOptional()
  @EmptyToNull()
  @Matches(IMAGE_URL_RE, { message: 'logo must be an uploaded image URL' })
  logo?: string | null;
}

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
  @IsOptional()
  @IsBoolean()
  acceptingOrders?: boolean;
}

export class PublicRestaurantQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  cuisine?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  country?: string;

  /** Comma-separated list, e.g. "$,$$". */
  @IsOptional()
  @Matches(/^\${1,4}(,\${1,4})*$/)
  priceRange?: string;

  @IsOptional()
  @IsIn(['rating', 'rating_asc', 'newest', 'name_asc', 'popular', 'price_asc', 'price_desc'])
  sort?: string;

  @IsOptional()
  @IsIn(['delivery', 'dine_in', 'pickup'])
  service?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;
}
