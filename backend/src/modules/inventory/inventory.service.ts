import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryItem, InventoryItemDocument } from './inventory.schema';
import { AccessControlService } from '../../common/services/access-control.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryItem.name) private inventoryModel: Model<InventoryItemDocument>,
    private access: AccessControlService,
  ) {}

  private async owned(user: any, id: string) {
    const doc = await this.inventoryModel.findById(id);
    if (!doc) throw new NotFoundException('Inventory item not found');
    await this.access.assertRestaurantOwner(user, doc.restaurantId.toString());
    return doc;
  }

  private clean(data: any, partial = false) {
    const out: Record<string, unknown> = {};
    if (!partial || data.name !== undefined) {
      const name = String(data.name || '').trim();
      if (!name) throw new BadRequestException('Item name is required');
      out.name = name;
    }
    for (const key of ['quantity', 'minQuantity', 'cost']) {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        const n = Number(data[key]);
        if (!Number.isFinite(n) || n < 0) throw new BadRequestException(`${key} must be a positive number`);
        out[key] = n;
      }
    }
    if (data.unit !== undefined) out.unit = String(data.unit).trim() || 'units';
    if (data.supplier !== undefined) out.supplier = String(data.supplier).trim() || null;
    return out;
  }

  async findByRestaurant(user: any, restaurantId: string) {
    await this.access.assertRestaurantOwner(user, restaurantId);
    return this.inventoryModel.find({ restaurantId }).sort({ name: 1 });
  }

  async getLowStock(user: any, restaurantId: string) {
    await this.access.assertRestaurantOwner(user, restaurantId);
    return this.inventoryModel.find({ restaurantId, $expr: { $lte: ['$quantity', '$minQuantity'] } });
  }

  async create(user: any, data: any) {
    const restaurantId = await this.access.getOwnerRestaurantId(user);
    return this.inventoryModel.create({ ...this.clean(data), restaurantId, lastRestocked: new Date() });
  }

  async update(user: any, id: string, data: any) {
    const item = await this.owned(user, id);
    const clean = this.clean(data, true);
    if (clean.quantity !== undefined && (clean.quantity as number) > item.quantity) clean.lastRestocked = new Date();
    return this.inventoryModel.findByIdAndUpdate(id, { $set: clean }, { returnDocument: 'after' });
  }

  async delete(user: any, id: string) {
    await this.owned(user, id);
    await this.inventoryModel.findByIdAndDelete(id);
    return { message: 'Item deleted' };
  }
}
