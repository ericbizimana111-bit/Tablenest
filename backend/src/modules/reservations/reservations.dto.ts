import { Type } from 'class-transformer';
import { IsIn, IsInt, IsMongoId, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { EmptyToNull } from '../../common/validation/validators';
import { DATE_RE, TIME_RE } from '../../common/utils/time';
import { ReservationStatus } from './reservation.schema';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateReservationDto {
  @IsMongoId({ message: 'restaurantId is required' })
  restaurantId: string;

  @Matches(DATE_RE, { message: 'Choose a valid date (YYYY-MM-DD)' })
  date: string;

  @Matches(TIME_RE, { message: 'Choose a valid time (HH:MM)' })
  time: string;

  @Type(() => Number)
  @IsInt({ message: 'Guests must be a whole number' })
  @Min(1, { message: 'Guests must be between 1 and 20' })
  @Max(20, { message: 'Guests must be between 1 and 20' })
  guests: number;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(500)
  notes?: string | null;

  /** Alias of `notes` accepted for older clients. */
  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(500)
  specialRequests?: string | null;

  @IsOptional()
  @EmptyToNull()
  @Matches(/^\+?[\d\s()-]{6,20}$/, { message: 'Enter a valid phone number' })
  phone?: string | null;
}

export class UpdateReservationDto {
  @IsOptional()
  @Matches(DATE_RE, { message: 'Choose a valid date (YYYY-MM-DD)' })
  date?: string;

  @IsOptional()
  @Matches(TIME_RE, { message: 'Choose a valid time (HH:MM)' })
  time?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  guests?: number;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(500)
  notes?: string | null;
}

export class SetReservationStatusDto {
  @IsIn(Object.values(ReservationStatus))
  status: ReservationStatus;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(300)
  reason?: string | null;
}

export class CancelReservationDto {
  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(300)
  reason?: string | null;
}

export class AvailabilityQueryDto {
  @IsMongoId({ message: 'restaurantId is required' })
  restaurantId: string;

  @Matches(DATE_RE, { message: 'A valid date (YYYY-MM-DD) is required' })
  date: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  guests?: number;
}

export class RestaurantReservationsQueryDto extends PaginationQueryDto {
  /** `all`, one status, or a comma-separated list. */
  @IsOptional()
  @Matches(/^(all|[a-z_]+(,[a-z_]+)*)$/)
  status?: string;

  @IsOptional()
  @Matches(DATE_RE)
  date?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  upcoming?: string;
}

export class CalendarQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;
}
