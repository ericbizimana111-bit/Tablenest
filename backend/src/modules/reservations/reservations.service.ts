import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Reservation, ReservationDocument, ReservationStatus } from './reservation.schema';
import { Restaurant, RestaurantDocument } from '../restaurants/restaurant.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.schema';
import * as crypto from 'crypto';

@Injectable()
export class ReservationsService {
  private assertValidId(value: string, field: string) {
    if (!isValidObjectId(value)) {
      throw new BadRequestException(`Invalid ${field}: ${value}`);
    }
  }
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    private notificationsService: NotificationsService,
  ) { }

  async create(customerId: string, data: any) {
    if (!data.restaurantId) {
      throw new BadRequestException('restaurantId is required');
    }
    this.assertValidId(data.restaurantId, 'restaurantId');

    // Validate date is not in the past
    if (data.date) {
      const bookingDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingDate < today) {
        throw new BadRequestException('Cannot book a date in the past');
      }
    }

    // Validate guests
    if (data.guests && (data.guests < 1 || data.guests > 20)) {
      throw new BadRequestException('Guests must be between 1 and 20');
    }

    const bookingRef = 'TN-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const reservation = await this.reservationModel.create({
      ...data,
      customerId,
      bookingRef,
      status: ReservationStatus.PENDING,
      tableId: data.tableId || null,
      specialRequests: data.notes || data.specialRequests || null,
    });

    // Notify restaurant owner
    try {
      const restaurant = await this.restaurantModel.findById(data.restaurantId).select('name ownerId');
      if (restaurant?.ownerId) {
        await this.notificationsService.create(restaurant.ownerId.toString(), {
          title: 'New Booking Request',
          message: `New booking at ${restaurant.name} for ${data.guests} guests on ${data.date} at ${data.time}.`,
          type: NotificationType.BOOKING,
          link: '/owner/reservations',
          metadata: { reservationId: reservation._id, restaurantId: data.restaurantId },
        });
      }
    } catch { /* notification failure should not block booking */ }

    return reservation;
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, status, restaurantId, customerId, date } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (restaurantId) {
      this.assertValidId(restaurantId, 'restaurantId');
      filter.restaurantId = restaurantId;
    }
    if (customerId) {
      this.assertValidId(customerId, 'customerId');
      filter.customerId = customerId;
    }
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
    this.assertValidId(id, 'id');
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
    this.assertValidId(id, 'id');
    const reservation = await this.reservationModel.findByIdAndUpdate(id, { status: ReservationStatus.CONFIRMED }, { returnDocument: 'after' });
    // Notify customer
    if (reservation) {
      try {
        const restaurant = await this.restaurantModel.findById(reservation.restaurantId).select('name');
        await this.notificationsService.create(reservation.customerId.toString(), {
          title: 'Booking Confirmed',
          message: `Your booking at ${restaurant?.name || 'the restaurant'} for ${reservation.guests} guests on ${reservation.date} at ${reservation.time} has been confirmed.`,
          type: NotificationType.BOOKING,
          link: '/my-bookings',
          metadata: { reservationId: reservation._id },
        });
      } catch { /* notification failure should not block */ }
    }
    return reservation;
  }

  async cancel(id: string) {
    this.assertValidId(id, 'id');
    const reservation = await this.reservationModel.findByIdAndUpdate(id, { status: ReservationStatus.CANCELLED }, { returnDocument: 'after' });
    // Notify customer
    if (reservation) {
      try {
        const restaurant = await this.restaurantModel.findById(reservation.restaurantId).select('name');
        await this.notificationsService.create(reservation.customerId.toString(), {
          title: 'Booking Cancelled',
          message: `Your booking at ${restaurant?.name || 'the restaurant'} has been cancelled.`,
          type: NotificationType.BOOKING,
          link: '/my-bookings',
          metadata: { reservationId: reservation._id },
        });
      } catch { /* notification failure should not block */ }
    }
    return reservation;
  }

  async markArrived(id: string) {
    this.assertValidId(id, 'id');
    return this.reservationModel.findByIdAndUpdate(id, { status: ReservationStatus.ARRIVED }, { returnDocument: 'after' });
  }

  async getCalendarData(restaurantId: string, month: number, year: number) {
    this.assertValidId(restaurantId, 'restaurantId');
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
    if (restaurantId) {
      this.assertValidId(restaurantId, 'restaurantId');
      match.restaurantId = restaurantId;
    }
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
