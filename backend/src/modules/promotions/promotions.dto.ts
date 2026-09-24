import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { EmptyToNull, Trim } from '../../common/validation/validators';

export class CreatePromotionDto {
  @Trim()
  @IsString()
  @MinLength(1, { message: 'Promotion name is required' })
  @MaxLength(80)
  name: string;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @IsOptional()
  @IsIn(['percentage', 'flat'])
  discountType?: 'percentage' | 'flat';

  @Type(() => Number)
  @IsNumber({}, { message: 'Discount value must be a number' })
  @Min(0.01, { message: 'Discount value must be greater than 0' })
  @Max(10_000_000)
  discountValue: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrder?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  usageLimit?: number;

  @Matches(/^\d{4}-\d{2}-\d{2}/, { message: 'Start date is required' })
  startDate: string;

  @Matches(/^\d{4}-\d{2}-\d{2}/, { message: 'End date is required' })
  endDate: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  applicableCategories?: string[];

  /** Optional checkout code. Promotions without a code apply automatically. */
  @IsOptional()
  @EmptyToNull()
  @Matches(/^[A-Za-z0-9_-]{3,30}$/, { message: 'Code must be 3–30 letters, numbers, - or _' })
  code?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {}
