import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument, ReservationStatus } from './reservation.schema';
import * as crypto from 'crypto';

@Injectable()
export class ReservationsService {
  constructor(@InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>) {}

  async create(customerId: string, data: any) {
    const bookingRef = 'TN-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    return this.reservationModel.create({ ...data, customerId, bookingRef, status: ReservationStatus.PENDING });
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, status, restaurantId, customerId, date } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (restaurantId) filter.restaurantId = restaurantId;
    if (customerId) filter.customerId = customerId;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }
    const skip = (page - 1) * limit;
    const [reservations, total] = await Promise.all([
      this.reservationModel.find(filter).skip(skip).limit(+limit).sort({ date: 1, time: 1 }),
      this.reservationModel.countDocuments(filter),
    ]);
    return { reservations, total, page: +page, pages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const r = await this.reservationModel.findById(id);
    if (!r) throw new NotFoundException('Reservation not found');
    return r;
  }

  async findByCustomer(customerId: string) {
    return this.reservationModel.find({ customerId }).sort({ date: -1 });
  }

  async findByRestaurant(restaurantId: string, query: any = {}) {
    return this.findAll({ ...query, restaurantId });
  }

  async confirm(id: string) {
    return this.reservationModel.findByIdAndUpdate(id, { status: ReservationStatus.CONFIRMED }, { new: true });
  }

  async cancel(id: string) {
    return this.reservationModel.findByIdAndUpdate(id, { status: ReservationStatus.CANCELLED }, { new: true });
  }

  async markArrived(id: string) {
    return this.reservationModel.findByIdAndUpdate(id, { status: ReservationStatus.ARRIVED }, { new: true });
  }

  async getCalendarData(restaurantId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    const reservations = await this.reservationModel.find({
      restaurantId,
      date: { $gte: start, $lte: end },
    });
    const grouped: Record<string, any> = {};
    reservations.forEach(r => {
      const key = r.date.toISOString().split('T')[0];
      if (!grouped[key]) grouped[key] = { confirmed: 0, pending: 0, cancelled: 0, noShow: 0 };
      if (r.status === ReservationStatus.CONFIRMED) grouped[key].confirmed++;
      else if (r.status === ReservationStatus.PENDING) grouped[key].pending++;
      else if (r.status === ReservationStatus.CANCELLED) grouped[key].cancelled++;
      else if (r.status === ReservationStatus.NO_SHOW) grouped[key].noShow++;
    });
    return grouped;
  }

  async getStats(restaurantId?: string) {
    const match: any = {};
    if (restaurantId) match.restaurantId = restaurantId;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const [total, todayTotal, confirmed, pending] = await Promise.all([
      this.reservationModel.countDocuments(match),
      this.reservationModel.countDocuments({ ...match, date: { $gte: today, $lte: todayEnd } }),
      this.reservationModel.countDocuments({ ...match, status: ReservationStatus.CONFIRMED }),
      this.reservationModel.countDocuments({ ...match, status: ReservationStatus.PENDING }),
    ]);
    return { total, todayTotal, confirmed, pending };
  }
}
