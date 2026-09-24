import { Transform, Type } from 'class-transformer';
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
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class OrderItemDto {
  @IsMongoId()
  menuItemId: string;

  @IsInt()
  @Min(1)
  @Max(50)
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}

export class CreateOrderDto {
  @IsMongoId()
  restaurantId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsIn(['delivery', 'pickup', 'dine_in'])
  orderType: 'delivery' | 'pickup' | 'dine_in';

  @IsOptional()
  @IsString()
  @MaxLength(300)
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsMongoId()
  tableId?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(40)
  promoCode?: string;

  @IsIn(['cash', 'card'])
  paymentMethod: 'cash' | 'card';

  @IsOptional()
  @IsInt()
  @Min(0)
  cardIndex?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  tip?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}

/** Same body as CreateOrderDto minus placement details — used to preview totals. */
export class QuoteOrderDto {
  @IsMongoId()
  restaurantId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsIn(['delivery', 'pickup', 'dine_in'])
  orderType: 'delivery' | 'pickup' | 'dine_in';

  @IsOptional()
  @IsString()
  @MaxLength(40)
  promoCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  tip?: number;
}
