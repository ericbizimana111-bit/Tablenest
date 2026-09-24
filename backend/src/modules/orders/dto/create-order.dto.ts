import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { EmptyToNull, Trim } from '../../../common/validation/validators';
import { OrderStatus } from '../order.schema';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export const MAX_QTY_PER_LINE = 50;

/** Only an id and a quantity — the server looks up names and prices itself. */
class OrderItemDto {
  @IsMongoId({ message: 'Each item needs a valid menuItemId' })
  menuItemId: string;

  @Type(() => Number)
  @IsInt({ message: 'Quantity must be a whole number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(MAX_QTY_PER_LINE, { message: `Quantity cannot exceed ${MAX_QTY_PER_LINE}` })
  quantity: number;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(200)
  notes?: string | null;
}

/** Same body as CreateOrderDto minus placement details — used to preview totals. */
export class QuoteOrderDto {
  @IsMongoId({ message: 'restaurantId is required' })
  restaurantId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Your cart is empty' })
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsIn(['delivery', 'pickup', 'dine_in'], { message: 'orderType must be delivery, pickup or dine_in' })
  orderType: 'delivery' | 'pickup' | 'dine_in';

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(40)
  promoCode?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1_000_000)
  tip?: number;
}

export class CreateOrderDto extends QuoteOrderDto {
  @IsOptional()
  @EmptyToNull()
  @Trim()
  @IsString()
  @MaxLength(300)
  deliveryAddress?: string | null;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(500)
  notes?: string | null;

  @IsOptional()
  @IsMongoId()
  tableId?: string;

  @IsIn(['cash', 'card'])
  paymentMethod: 'cash' | 'card';

  @IsOptional()
  @IsInt()
  @Min(0)
  cardIndex?: number;

  @IsOptional()
  @EmptyToNull()
  @Matches(/^\+?[\d\s()-]{6,20}$/, { message: 'Enter a valid phone number' })
  phone?: string | null;

  /** Alternative to the Idempotency-Key header. */
  @IsOptional()
  @Matches(/^[\w-]{8,64}$/)
  clientRequestId?: string;
}

export class UpdateOrderStatusDto {
  @IsIn(Object.values(OrderStatus))
  status: OrderStatus;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(300)
  note?: string | null;
}

export class OrdersQueryDto extends PaginationQueryDto {
  /** `all`, `active`, `past`, one status or a comma-separated list. */
  @IsOptional()
  @Matches(/^(all|active|past|[a-z_]+(,[a-z_]+)*)$/)
  status?: string;
}

export class RevenueQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days?: number;
}
