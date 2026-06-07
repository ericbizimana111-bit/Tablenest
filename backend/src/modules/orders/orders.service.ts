import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './order.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}

  private assertValidId(value: string, field: string) {
    if (!isValidObjectId(value)) {
      throw new BadRequestException(`Invalid ${field}: ${value}`);
    }
  }

  async create(customerId: string, data: CreateOrderDto) {
    const { userId, ...orderData } = data;
    if (!data.restaurantId) {
      throw new BadRequestException('restaurantId is required');
    }
    this.assertValidId(data.restaurantId, 'restaurantId');
    if (data.userId !== customerId) {
      throw new BadRequestException('userId must match authenticated user');
    }
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new BadRequestException('items is required and must contain at least one item');
    }

    const order = await this.orderModel.create({
      ...orderData,
      customerId,
      status: OrderStatus.PLACED,
      statusHistory: [{ status: OrderStatus.PLACED, time: new Date(), note: 'Order placed' }],
    });
    return order;
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, status, restaurantId, customerId } = query;
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
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).skip(skip).limit(+limit).sort({ createdAt: -1 }),
      this.orderModel.countDocuments(filter),
    ]);
    return { orders, total, page: +page, pages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    this.assertValidId(id, 'id');
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByCustomer(customerId: string, query: any = {}) {
    this.assertValidId(customerId, 'customerId');
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
    this.assertValidId(restaurantId, 'restaurantId');
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

  async updateStatus(id: string, status: OrderStatus, note?: string) {
    this.assertValidId(id, 'id');
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      {
        status,
        $push: { statusHistory: { status, time: new Date(), note: note || '' } },
      },
      { returnDocument: 'after' },
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async cancel(id: string) {
    return this.updateStatus(id, OrderStatus.CANCELLED, 'Order cancelled');
  }

  async getStats(restaurantId?: string) {
    const match: any = {};
    if (restaurantId) {
      this.assertValidId(restaurantId, 'restaurantId');
      match.restaurantId = restaurantId;
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
    if (restaurantId) {
      this.assertValidId(restaurantId, 'restaurantId');
    }
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.orderModel.aggregate([
      { $match: { restaurantId, status: OrderStatus.DELIVERED, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
  }
}
