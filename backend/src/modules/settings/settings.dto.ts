import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, Matches, Max, Min, ValidateNested } from 'class-validator';

class PlanDto {
  @IsNumber()
  @Min(0)
  monthlyFee: number;

  @IsNumber()
  @Min(0)
  @Max(0.5)
  commissionRate: number;
}

class PlansDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PlanDto)
  starter?: PlanDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PlanDto)
  pro?: PlanDto;
}

export class UpdateSettingsDto {
  @IsOptional()
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be a 3-letter ISO code such as USD or RWF' })
  currency?: string;

  @IsOptional()
  @IsBoolean()
  requireRestaurantApproval?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.3)
  serviceFeeRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceFeeCap?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bookingFeePerCover?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => PlansDto)
  plans?: PlansDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sponsoredWeeklyFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  loyaltyPointsPerUnit?: number;
}
