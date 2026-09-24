import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Table, TableDocument, TableStatus } from './table.schema';
import { AccessControlService } from '../../common/services/access-control.service';

@Injectable()
export class TablesService {
  constructor(
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    private access: AccessControlService,
  ) {}

  private async owned(user: any, id: string) {
    const table = await this.tableModel.findById(id);
    if (!table) throw new NotFoundException('Table not found');
    await this.access.assertRestaurantOwner(user, table.restaurantId.toString());
    return table;
  }

  async findByRestaurant(user: any, restaurantId: string) {
    await this.access.assertRestaurantOwner(user, restaurantId);
    const tables = await this.tableModel.find({ restaurantId });
    return tables.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true }));
  }

  async create(user: any, data: any) {
    const restaurantId = await this.access.getOwnerRestaurantId(user);
    const tableNumber = String(data?.tableNumber || '').trim();
    const capacity = Number(data?.capacity);
    if (!tableNumber) throw new BadRequestException('Table number is required');
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 30) {
      throw new BadRequestException('Capacity must be between 1 and 30');
    }
    if (await this.tableModel.exists({ restaurantId, tableNumber })) {
      throw new BadRequestException(`Table ${tableNumber} already exists`);
    }
    return this.tableModel.create({ restaurantId, tableNumber, capacity });
  }

  async update(user: any, id: string, data: any) {
    const table = await this.owned(user, id);
    const update: Record<string, unknown> = {};
    if (data.tableNumber !== undefined) {
      const tableNumber = String(data.tableNumber).trim();
      if (!tableNumber) throw new BadRequestException('Table number is required');
      if (tableNumber !== table.tableNumber && (await this.tableModel.exists({ restaurantId: table.restaurantId, tableNumber }))) {
        throw new BadRequestException(`Table ${tableNumber} already exists`);
      }
      update.tableNumber = tableNumber;
    }
    if (data.capacity !== undefined) {
      const capacity = Number(data.capacity);
      if (!Number.isInteger(capacity) || capacity < 1 || capacity > 30) {
        throw new BadRequestException('Capacity must be between 1 and 30');
      }
      update.capacity = capacity;
    }
    if (data.serverNotes !== undefined) update.serverNotes = data.serverNotes;
    return this.tableModel.findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' });
  }

  async updateStatus(user: any, id: string, status: TableStatus, guestId?: string, serverNotes?: string) {
    await this.owned(user, id);
    if (!Object.values(TableStatus).includes(status)) throw new BadRequestException('Invalid status');
    const update: any = { status };
    if (guestId) update.currentGuestId = guestId;
    if (serverNotes !== undefined) update.serverNotes = String(serverNotes).slice(0, 200) || null;
    if (status === TableStatus.OCCUPIED) update.seatedAt = new Date();
    if (status === TableStatus.AVAILABLE) {
      update.currentGuestId = null;
      update.seatedAt = null;
      update.serverNotes = null;
    }
    return this.tableModel.findByIdAndUpdate(id, update, { returnDocument: 'after' });
  }

  async delete(user: any, id: string) {
    await this.owned(user, id);
    await this.tableModel.findByIdAndDelete(id);
    return { message: 'Table deleted' };
  }

  async getFloorPlan(user: any, restaurantId: string) {
    const tables = await this.findByRestaurant(user, restaurantId);
    const count = (s: TableStatus) => tables.filter((t) => t.status === s).length;
    return {
      tables,
      stats: {
        total: tables.length,
        available: count(TableStatus.AVAILABLE),
        occupied: count(TableStatus.OCCUPIED),
        reserved: count(TableStatus.RESERVED),
        blocked: count(TableStatus.BLOCKED),
        seats: tables.reduce((s, t) => s + t.capacity, 0),
      },
    };
  }
}
