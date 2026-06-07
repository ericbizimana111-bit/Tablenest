import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryItem, InventoryItemDocument } from './inventory.schema';

@Injectable()
export class InventoryService {
    constructor(@InjectModel(InventoryItem.name) private inventoryModel: Model<InventoryItemDocument>) { }

    async findByRestaurant(restaurantId: string) {
        return this.inventoryModel.find({ restaurantId }).sort({ name: 1 });
    }

    async getLowStock(restaurantId: string) {
        return this.inventoryModel.find({ restaurantId, $expr: { $lte: ['$quantity', '$minQuantity'] } });
    }

    async create(restaurantId: string, data: any) {
        return this.inventoryModel.create({ ...data, restaurantId });
    }

    async update(id: string, data: any) {
        return this.inventoryModel.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' });
    }

    async delete(id: string) {
        await this.inventoryModel.findByIdAndDelete(id);
        return { message: 'Item deleted' };
    }
}
