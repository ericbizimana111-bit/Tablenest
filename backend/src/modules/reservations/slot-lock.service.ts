import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReservationSlot, ReservationSlotDocument } from './reservation.schema';

export const SLOT_MINUTES = 30;
export const DWELL_MINUTES = 90;

const isDuplicateKey = (err: unknown) => (err as { code?: number })?.code === 11000;

/** The 30-minute slots a booking starting at `startMin` occupies. */
export const slotsFor = (startMin: number) =>
  Array.from({ length: DWELL_MINUTES / SLOT_MINUTES }, (_, i) => startMin + i * SLOT_MINUTES);

type Key = { restaurantId: Types.ObjectId; date: Date };

/**
 * Atomic seat/table locking on top of the unique index in `reservationslots`. Works on a standalone
 * MongoDB (no transactions needed); every acquire either fully succeeds or rolls itself back.
 */
@Injectable()
export class SlotLockService {
  private readonly logger = new Logger('SlotLock');

  constructor(@InjectModel(ReservationSlot.name) private slotModel: Model<ReservationSlotDocument>) {}

  /** Locks `table` for every slot; returns false if any slot is held by another booking. */
  async lockTable(key: Key, tableId: Types.ObjectId, startMin: number, guests: number, reservationId: Types.ObjectId) {
    const acquired: number[] = [];
    for (const slot of slotsFor(startMin)) {
      try {
        await this.slotModel.create({ ...key, slot, tableId, seats: guests, reservationIds: [reservationId] });
        acquired.push(slot);
      } catch (err) {
        if (!isDuplicateKey(err)) {
          await this.unlockTableSlots(key, tableId, acquired, reservationId);
          throw err;
        }
        // Already ours (rescheduling onto an overlapping time) counts as acquired.
        const mine = await this.slotModel.exists({ ...key, slot, tableId, reservationIds: reservationId });
        if (!mine) {
          await this.unlockTableSlots(key, tableId, acquired, reservationId);
          return false;
        }
      }
    }
    return true;
  }

  private async unlockTableSlots(key: Key, tableId: Types.ObjectId, slots: number[], reservationId: Types.ObjectId) {
    if (!slots.length) return;
    await this.slotModel.deleteMany({ ...key, tableId, slot: { $in: slots }, reservationIds: reservationId });
  }

  /** Reserves `guests` seats out of `capacity` in every slot; returns false when any slot is full. */
  async lockSeats(key: Key, startMin: number, guests: number, capacity: number, reservationId: Types.ObjectId) {
    if (guests > capacity) return false;
    const acquired: number[] = [];
    for (const slot of slotsFor(startMin)) {
      try {
        const res = await this.slotModel.findOneAndUpdate(
          { ...key, slot, tableId: null, seats: { $lte: capacity - guests }, reservationIds: { $ne: reservationId } },
          { $inc: { seats: guests }, $push: { reservationIds: reservationId } },
          { upsert: true, returnDocument: 'after' },
        );
        if (!res) throw Object.assign(new Error('slot full'), { code: 11000 });
        acquired.push(slot);
      } catch (err) {
        await this.releaseSeats(key, acquired, guests, reservationId);
        if (isDuplicateKey(err)) return false;
        throw err;
      }
    }
    return true;
  }

  private async releaseSeats(key: Key, slots: number[], guests: number, reservationId: Types.ObjectId) {
    if (!slots.length) return;
    await this.slotModel.updateMany(
      { ...key, tableId: null, slot: { $in: slots }, reservationIds: reservationId },
      { $inc: { seats: -guests }, $pull: { reservationIds: reservationId } },
    );
  }

  /**
   * Releases everything a reservation holds. Idempotent: each lock is matched by reservation id,
   * so calling it twice never frees seats that belong to someone else.
   */
  async releaseAll(reservationId: Types.ObjectId, guests: number, except?: { tableId: Types.ObjectId; date: Date; slots: number[] }) {
    const tableFilter: Record<string, unknown> = { reservationIds: reservationId, tableId: { $ne: null } };
    if (except) tableFilter.$nor = [{ tableId: except.tableId, date: except.date, slot: { $in: except.slots } }];
    await this.slotModel.deleteMany(tableFilter);
    await this.slotModel.updateMany(
      { reservationIds: reservationId, tableId: null },
      { $inc: { seats: -guests }, $pull: { reservationIds: reservationId } },
    );
  }

  /** Current locks for a restaurant day, for availability calculation. */
  forDay(key: Key) {
    return this.slotModel.find(key).lean();
  }

  logInconsistency(msg: string) {
    this.logger.error(msg);
  }
}
