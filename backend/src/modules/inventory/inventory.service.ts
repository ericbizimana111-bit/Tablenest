import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Model } from 'mongoose';
import { InventoryItem, InventoryItemDocument } from './inventory.schema';
import { AccessControlService, Actor } from '../../common/services/access-control.service';
import { EmptyToNull, Trim } from '../../common/validation/validators';

export class CreateInventoryDto {
  @Trim()
  @IsString()
  @MinLength(1, { message: 'Item name is required' })
  @MaxLength(80)
  name: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'quantity must be a number' })
  @Min(0, { message: 'quantity cannot be negative' })
  @Max(10_000_000)
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'minQuantity cannot be negative' })
  @Max(10_000_000)
  minQuantity?: number;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(80)
  supplier?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'cost cannot be negative' })
  cost?: number;
}

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {}

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryItem.name) private inventoryModel: Model<InventoryItemDocument>,
    private access: AccessControlService,
  ) {}

  private async owned(user: Actor, id: string) {
    const doc = await this.inventoryModel.findById(id);
    if (!doc) throw new NotFoundException('Inventory item not found');
    await this.access.assertRestaurantOwner(user, doc.restaurantId.toString());
    return doc;
  }

  async findByRestaurant(user: Actor, restaurantId: string) {
    await this.access.assertRestaurantOwner(user, restaurantId);
    return this.inventoryModel.find({ restaurantId }).sort({ name: 1 }).limit(1000);
  }

  async getLowStock(user: Actor, restaurantId: string) {
    await this.access.assertRestaurantOwner(user, restaurantId);
    return this.inventoryModel.find({ restaurantId, $expr: { $lte: ['$quantity', '$minQuantity'] } });
  }

  async create(user: Actor, dto: CreateInventoryDto) {
    const restaurantId = await this.access.getOwnerRestaurantId(user);
    return this.inventoryModel.create({ ...dto, unit: dto.unit || 'units', restaurantId, lastRestocked: new Date() });
  }

  async update(user: Actor, id: string, dto: UpdateInventoryDto) {
    const item = await this.owned(user, id);
    const set: Record<string, unknown> = { ...dto };
    if (dto.quantity !== undefined && dto.quantity > item.quantity) set.lastRestocked = new Date();
    return this.inventoryModel.findByIdAndUpdate(id, { $set: set }, { returnDocument: 'after' });
  }

  async delete(user: Actor, id: string) {
    await this.owned(user, id);
    await this.inventoryModel.findByIdAndDelete(id);
    return { message: 'Item deleted' };
  }
}
