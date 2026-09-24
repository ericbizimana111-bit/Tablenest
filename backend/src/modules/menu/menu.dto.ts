import { PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { EmptyToNull, IMAGE_URL_RE, Trim } from '../../common/validation/validators';

export class CreateCategoryDto {
  @Trim()
  @IsString()
  @MinLength(1, { message: 'Category name is required' })
  @MaxLength(60)
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  sortOrder?: number;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class CreateMenuItemDto {
  @IsMongoId({ message: 'Choose a category' })
  categoryId: string;

  @Trim()
  @IsString()
  @MinLength(1, { message: 'Dish name is required' })
  @MaxLength(100)
  name: string;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Enter a valid price' })
  @Min(0, { message: 'Price cannot be negative' })
  @Max(10_000_000)
  price: number;

  @IsOptional()
  @EmptyToNull()
  @Matches(IMAGE_URL_RE, { message: 'image must be an uploaded image URL' })
  image?: string | null;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  isSoldOut?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  preparationTime?: number;
}

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {}
