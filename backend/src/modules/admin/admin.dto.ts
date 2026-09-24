import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsIn, IsInt, IsMongoId, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { EmptyToNull, Trim } from '../../common/validation/validators';
import { RestaurantStatus } from '../restaurants/restaurant.schema';
import { RestaurantPlan } from '../settings/platform-settings.schema';
import { ChargeStatus, ChargeType } from '../billing/platform-charge.schema';
import { TicketStatus, TicketType } from '../support/support.schema';
import { UserRole } from '../users/user.schema';
import { OrderStatus } from '../orders/order.schema';
import { ReservationStatus } from '../reservations/reservation.schema';

const PERIOD = /^\d{4}-(0[1-9]|1[0-2])$/;

export class AdminUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsIn(['true', 'false'])
  isActive?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class AdminUpdateUserDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /** Admin rights are granted only from the server CLI (`npm run admin:grant`), never over HTTP. */
  @IsOptional()
  @IsIn([UserRole.CUSTOMER, UserRole.OWNER])
  role?: UserRole.CUSTOMER | UserRole.OWNER;
}

export class AdminRestaurantsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(RestaurantStatus)
  status?: RestaurantStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class RestaurantStatusDto {
  @IsEnum(RestaurantStatus)
  status: RestaurantStatus;

  @ValidateIf((o: RestaurantStatusDto) => o.status === RestaurantStatus.REJECTED || o.status === RestaurantStatus.SUSPENDED)
  @Trim()
  @IsString()
  @MinLength(3, { message: 'Give a reason when rejecting or suspending a restaurant' })
  @MaxLength(500)
  reason?: string;
}

export class RestaurantBillingDto {
  @IsEnum(RestaurantPlan)
  plan: RestaurantPlan;

  /** Negotiated commission override (0–0.5); null restores the plan rate. */
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsNumber()
  @Min(0)
  @Max(0.5)
  commissionRate?: number | null;
}

export class SponsorshipDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(52)
  weeks: number;
}

export class AdminOrdersQueryDto extends PaginationQueryDto {
  /** A single status, or `active` for everything still in progress. */
  @IsOptional()
  @IsIn([...Object.values(OrderStatus), 'active'])
  status?: OrderStatus | 'active';

  @IsOptional()
  @IsMongoId()
  restaurantId?: string;

  @IsOptional()
  @IsMongoId()
  customerId?: string;
}

export class OrderCorrectionDto {
  @IsIn([OrderStatus.DELIVERED, OrderStatus.CANCELLED])
  status: OrderStatus.DELIVERED | OrderStatus.CANCELLED;

  @Trim()
  @IsString()
  @MinLength(3, { message: 'Explain the correction' })
  @MaxLength(300)
  note: string;
}

export class AdminReservationsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @IsOptional()
  @IsMongoId()
  restaurantId?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;
}

export class AdminUploadsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  ownerId?: string;
}

export class RevenueQueryDto {
  @Matches(PERIOD, { message: 'from must be YYYY-MM' })
  from: string;

  @Matches(PERIOD, { message: 'to must be YYYY-MM' })
  to: string;
}

export class ChargesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  restaurantId?: string;

  @IsOptional()
  @Matches(PERIOD)
  period?: string;

  @IsOptional()
  @IsEnum(ChargeStatus)
  status?: ChargeStatus;

  @IsOptional()
  @IsEnum(ChargeType)
  type?: ChargeType;
}

export class MarkPaidDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(500)
  @IsMongoId({ each: true })
  ids?: string[];

  @IsOptional()
  @IsMongoId()
  restaurantId?: string;

  @IsOptional()
  @Matches(PERIOD)
  period?: string;
}

export class VoidChargeDto {
  @Trim()
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  reason: string;
}

export class PeriodDto {
  @IsOptional()
  @Matches(PERIOD, { message: 'period must be YYYY-MM' })
  period?: string;
}

export class AuditQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Matches(/^[a-z_.]+$/)
  action?: string;

  @IsOptional()
  @IsMongoId()
  actorId?: string;
}

export class AdminTicketsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketType)
  type?: TicketType;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(100)
  search?: string;
}
