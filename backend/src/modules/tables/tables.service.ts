import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Table, TableDocument, TableStatus } from './table.schema';

@Injectable()
export class TablesService {
    constructor(@InjectModel(Table.name) private tableModel: Model<TableDocument>) { }

    async findByRestaurant(restaurantId: string) {
        return this.tableModel.find({ restaurantId }).sort({ tableNumber: 1 });
    }

    async create(restaurantId: string, data: any) {
        return this.tableModel.create({ ...data, restaurantId });
    }

    async update(id: string, data: any) {
        return this.tableModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    }

    async updateStatus(id: string, status: TableStatus, guestId?: string) {
        const update: any = { status };
        if (guestId) { update.currentGuestId = guestId; update.seatedAt = new Date(); }
        if (status === TableStatus.AVAILABLE) { update.currentGuestId = null; update.seatedAt = null; update.serverNotes = null; }
        return this.tableModel.findByIdAndUpdate(id, update, { new: true });
    }

    async delete(id: string) {
        await this.tableModel.findByIdAndDelete(id);
        return { message: 'Table deleted' };
    }

    async getFloorPlan(restaurantId: string) {
        const tables = await this.tableModel.find({ restaurantId });
        const stats = {
            total: tables.length,
            available: tables.filter(t => t.status === TableStatus.AVAILABLE).length,
            occupied: tables.filter(t => t.status === TableStatus.OCCUPIED).length,
            reserved: tables.filter(t => t.status === TableStatus.RESERVED).length,
        };
        return { tables, stats };
    }
}
