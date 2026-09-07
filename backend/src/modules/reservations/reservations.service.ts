import { ForbiddenException, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Reservation, ReservationDocument, ReservationStatus } from './reservation.schema';
import { Restaurant, RestaurantDocument } from '../restaurants/restaurant.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.schema';
import * as crypto from 'crypto';
import { AccessControlService } from '../../common/services/access-control.service';

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
    private accessControl: AccessControlService,
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

    const restaurant = await this.restaurantModel.findById(data.restaurantId).select('name ownerId images');
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    const bookingRef = 'TN-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const reservation = await this.reservationModel.create({
      ...data,
      customerId,
      restaurantName: data.restaurantName || restaurant.name,
      restaurantImage: data.restaurantImage || restaurant.images?.[0] || null,
      bookingRef,
      status: ReservationStatus.PENDING,
      tableId: data.tableId || null,
      specialRequests: data.notes || data.specialRequests || null,
    });

    // Notify restaurant owner
    try {
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

  async confirm(id: string, actor?: any) {
    this.assertValidId(id, 'id');
    const existing = await this.reservationModel.findById(id);
    if (!existing) throw new NotFoundException('Reservation not found');
    if (actor) await this.accessControl.assertRestaurantOwner(actor, existing.restaurantId.toString());
    const reservation = await this.reservationModel.findByIdAndUpdate(id, { status: ReservationStatus.CONFIRMED }, { returnDocument: 'after' });
    // Notify customer
    if (reservation) {
      try {
        const restaurant = await this.restaurantModel.findById(reservation.restaurantId).select('name');
        await this.notificationsService.create(reservation.customerId.toString(), {
          title: 'Booking Confirmed',
          message: `Your booking at ${restaurant?.name || 'the restaurant'} for ${reservation.guests} guests on ${reservation.date.toISOString()} at ${reservation.time} has been confirmed.`,
          type: NotificationType.BOOKING,
          link: '/my-bookings',
          metadata: { reservationId: reservation._id },
        });
      } catch { /* notification failure should not block */ }
    }
    return reservation;
  }

  async cancel(id: string, actor?: any) {
    this.assertValidId(id, 'id');
    const existing = await this.reservationModel.findById(id);
    if (!existing) throw new NotFoundException('Reservation not found');
    if (actor) {
      const isCustomer = existing.customerId.toString() === actor._id.toString();
      if (actor.role === 'owner') await this.accessControl.assertRestaurantOwner(actor, existing.restaurantId.toString());
      else if (!isCustomer) throw new ForbiddenException('Cannot cancel this reservation');
    }
    const reservation = await this.reservationModel.findByIdAndUpdate(id, { status: ReservationStatus.CANCELLED }, { returnDocument: 'after' });
    if (reservation) {
      try {
        const restaurant = await this.restaurantModel.findById(reservation.restaurantId).select('name');
        const isCustomer = actor?._id?.toString() === reservation.customerId.toString();
        const recipientId = isCustomer
          ? (await this.restaurantModel.findById(reservation.restaurantId).select('ownerId'))?.ownerId?.toString()
          : reservation.customerId.toString();
        if (!recipientId) return reservation;
        await this.notificationsService.create(recipientId, {
          title: isCustomer ? 'Booking Cancelled by Customer' : 'Booking Cancelled',
          message: isCustomer
            ? `A customer cancelled their booking at ${restaurant?.name || 'your restaurant'}.`
            : `Your booking at ${restaurant?.name || 'the restaurant'} has been cancelled.`,
          type: NotificationType.BOOKING,
          link: isCustomer ? '/owner/reservations' : '/my-bookings',
          metadata: { reservationId: reservation._id },
        });
      } catch { /* notification failure should not block */ }
    }
    return reservation;
  }

  async update(id: string, actor: any, data: any) {
    this.assertValidId(id, 'id');
    const existing = await this.reservationModel.findById(id);
    if (!existing) throw new NotFoundException('Reservation not found');
    if (existing.customerId.toString() !== actor._id.toString()) {
      throw new ForbiddenException('Cannot update this reservation');
    }
    if (![ReservationStatus.PENDING, ReservationStatus.CONFIRMED].includes(existing.status)) {
      throw new BadRequestException('Only pending or confirmed future reservations can be updated');
    }
    const date = data.date ? new Date(data.date) : existing.date;
    const reservationDateTime = new Date(`${date.toISOString().slice(0, 10)}T${data.time || existing.time}`);
    if (reservationDateTime <= new Date()) throw new BadRequestException('Reservation must be in the future');
    if (data.guests !== undefined && (data.guests < 1 || data.guests > 20)) {
      throw new BadRequestException('Guests must be between 1 and 20');
    }
    return this.reservationModel.findByIdAndUpdate(id, {
      date,
      time: data.time || existing.time,
      guests: data.guests ?? existing.guests,
      status: ReservationStatus.PENDING,
    }, { returnDocument: 'after' });
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
