import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './order.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { NotificationType } from '../notifications/notification.schema';
import { AccessControlService } from '../../common/services/access-control.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private notificationsService: NotificationsService,
    private loyaltyService: LoyaltyService,
    private accessControl: AccessControlService,
  ) {}

  async create(customerId: string, data: any) {
    const order = await this.orderModel.create({
      ...data,
      customerId,
      status: OrderStatus.PLACED,
      statusHistory: [{ status: OrderStatus.PLACED, time: new Date(), note: 'Order placed' }],
    });

    await this.notificationsService.create(customerId, {
      title: 'Order Placed',
      message: `Your order has been placed successfully. Total: $${data.total?.toFixed?.(2) ?? data.total}`,
      type: NotificationType.ORDER,
      link: `/my-orders/${order._id}/track`,
    });

    return order;
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, status, restaurantId, customerId } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (restaurantId) filter.restaurantId = restaurantId;
    if (customerId) filter.customerId = customerId;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).skip(skip).limit(+limit).sort({ createdAt: -1 }),
      this.orderModel.countDocuments(filter),
    ]);
    return { orders, total, page: +page, pages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByCustomer(customerId: string, query: any = {}) {
    const { status, page = 1, limit = 10 } = query;
    const filter: any = { customerId };
    if (status && status !== 'all') filter.status = status;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).skip(skip).limit(+limit).sort({ createdAt: -1 }),
      this.orderModel.countDocuments(filter),
    ]);
    return { orders, total, page: +page, pages: Math.ceil(total / limit) };
  }

  async findByRestaurant(restaurantId: string, query: any = {}) {
    const { status, page = 1, limit = 20 } = query;
    const filter: any = { restaurantId };
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).skip(skip).limit(+limit).sort({ createdAt: -1 }),
      this.orderModel.countDocuments(filter),
    ]);
    return { orders, total, page: +page, pages: Math.ceil(total / limit) };
  }

  async updateStatus(id: string, status: OrderStatus, note?: string, actor?: any) {
    const existing = await this.orderModel.findById(id);
    if (!existing) throw new NotFoundException('Order not found');

    if (actor) {
      await this.accessControl.assertRestaurantOwner(actor, existing.restaurantId.toString());
    }

    const order = await this.orderModel.findByIdAndUpdate(
      id,
      {
        status,
        $push: { statusHistory: { status, time: new Date(), note: note || '' } },
      },
      { new: true },
    );

    if (order) {
      await this.notificationsService.create(order.customerId.toString(), {
        title: 'Order Update',
        message: `Your order status is now: ${status.replace(/_/g, ' ')}`,
        type: NotificationType.ORDER,
        link: `/my-orders/${order._id}/track`,
      });

      if (status === OrderStatus.DELIVERED) {
        const points = Math.floor(order.total / 10);
        if (points > 0) {
          await this.loyaltyService.addPoints(order.customerId.toString(), points, `Order reward - $${order.total}`);
        }
      }
    }

    return order;
  }

  async cancel(id: string, user?: any) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    if (user) {
      const isCustomer = order.customerId.toString() === user._id.toString();
      const isAdmin = user.role === 'super_admin';
      let isOwner = false;
      if (user.role === 'owner') {
        try {
          await this.accessControl.assertRestaurantOwner(user, order.restaurantId.toString());
          isOwner = true;
        } catch {
          isOwner = false;
        }
      }
      if (!isCustomer && !isAdmin && !isOwner) {
        throw new ForbiddenException('Cannot cancel this order');
      }
    }

    return this.updateStatus(id, OrderStatus.CANCELLED, 'Order cancelled');
  }

  async getStats(restaurantId?: string) {
    const match: any = {};
    if (restaurantId) match.restaurantId = restaurantId;
    const [total, delivered, active, cancelled, revenue] = await Promise.all([
      this.orderModel.countDocuments(match),
      this.orderModel.countDocuments({ ...match, status: OrderStatus.DELIVERED }),
      this.orderModel.countDocuments({ ...match, status: { $in: [OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.OUT_FOR_DELIVERY] } }),
      this.orderModel.countDocuments({ ...match, status: OrderStatus.CANCELLED }),
      this.orderModel.aggregate([
        { $match: { ...match, status: OrderStatus.DELIVERED } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);
    return { total, delivered, active, cancelled, revenue: revenue[0]?.total || 0 };
  }

  async getRevenueByDay(restaurantId: string, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.orderModel.aggregate([
      { $match: { restaurantId, status: OrderStatus.DELIVERED, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
  }
}
