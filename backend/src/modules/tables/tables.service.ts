import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { Table, TableDocument, TableStatus } from './table.schema';
import { Reservation, ReservationDocument, ACTIVE_RESERVATION_STATUSES } from '../reservations/reservation.schema';
import { AccessControlService, Actor } from '../../common/services/access-control.service';
import { CreateTableDto, UpdateTableDto, UpdateTableStatusDto } from './tables.dto';
import { dayStart, zonedNow } from '../../common/utils/time';
import { RestaurantDocument } from '../restaurants/restaurant.schema';

@Injectable()
export class TablesService {
  constructor(
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    private access: AccessControlService,
    private config: ConfigService,
  ) {}

  private async owned(user: Actor, id: string) {
    const table = await this.tableModel.findById(id);
    if (!table) throw new NotFoundException('Table not found');
    const restaurant = await this.access.assertRestaurantOwner(user, table.restaurantId.toString());
    return { table, restaurant };
  }

  /** Active bookings on this table from today onwards (in the restaurant's time zone). */
  private upcoming(table: TableDocument, restaurant: RestaurantDocument) {
    const today = zonedNow(restaurant.timezone || this.config.get('DEFAULT_TIMEZONE', 'UTC')).date;
    return this.reservationModel.find({ tableId: table._id, status: { $in: ACTIVE_RESERVATION_STATUSES }, date: { $gte: dayStart(today) } });
  }

  async findByRestaurant(user: Actor, restaurantId: string) {
    await this.access.assertRestaurantOwner(user, restaurantId);
    const tables = await this.tableModel.find({ restaurantId });
    return tables.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true }));
  }

  async create(user: Actor, dto: CreateTableDto) {
    const restaurantId = await this.access.getOwnerRestaurantId(user);
    if (await this.tableModel.exists({ restaurantId, tableNumber: dto.tableNumber })) {
      throw new ConflictException(`Table ${dto.tableNumber} already exists`);
    }
    return this.tableModel.create({ restaurantId, tableNumber: dto.tableNumber, capacity: dto.capacity });
  }

  async update(user: Actor, id: string, dto: UpdateTableDto) {
    const { table, restaurant } = await this.owned(user, id);
    if (dto.tableNumber && dto.tableNumber !== table.tableNumber && (await this.tableModel.exists({ restaurantId: table.restaurantId, tableNumber: dto.tableNumber }))) {
      throw new ConflictException(`Table ${dto.tableNumber} already exists`);
    }
    if (dto.capacity !== undefined && dto.capacity < table.capacity) {
      const biggest = (await this.upcoming(table, restaurant)).reduce((m, r) => Math.max(m, r.guests), 0);
      if (biggest > dto.capacity) {
        throw new ConflictException(`This table has an upcoming booking for ${biggest} guests. Move it before reducing capacity.`);
      }
    }
    const updated = await this.tableModel.findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after' });
    if (dto.tableNumber) await this.reservationModel.updateMany({ tableId: table._id }, { tableNumber: dto.tableNumber });
    return updated;
  }

  async updateStatus(user: Actor, id: string, dto: UpdateTableStatusDto) {
    await this.owned(user, id);
    const update: Record<string, unknown> = { status: dto.status };
    if (dto.guestId) update.currentGuestId = dto.guestId;
    if (dto.serverNotes !== undefined) update.serverNotes = dto.serverNotes;
    if (dto.status === TableStatus.OCCUPIED) update.seatedAt = new Date();
    if (dto.status === TableStatus.AVAILABLE) {
      update.currentGuestId = null;
      update.seatedAt = null;
      update.serverNotes = null;
    }
    return this.tableModel.findByIdAndUpdate(id, update, { returnDocument: 'after' });
  }

  async delete(user: Actor, id: string) {
    const { table, restaurant } = await this.owned(user, id);
    const pending = await this.upcoming(table, restaurant);
    if (pending.length) {
      throw new ConflictException(`Table ${table.tableNumber} has ${pending.length} upcoming booking(s). Cancel or move them first.`);
    }
    await this.tableModel.findByIdAndDelete(id);
    return { message: 'Table deleted' };
  }

  async getFloorPlan(user: Actor, restaurantId: string) {
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
