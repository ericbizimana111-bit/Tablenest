import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';

class OrderItemDto {
  @IsMongoId()
  @IsNotEmpty()
  menuItemId: string;

  @IsNotEmpty()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  image?: string;
}

export class CreateOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;

  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  total: number;
}
