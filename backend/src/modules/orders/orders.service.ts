import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { Order, OrderDocument, OrderStatus, OrderType } from './order.schema';
import { MenuItem, MenuItemDocument } from '../menu/menu.schema';
import { Restaurant, RestaurantDocument, RestaurantStatus } from '../restaurants/restaurant.schema';
import { Table, TableDocument } from '../tables/table.schema';
import { User, UserDocument } from '../users/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.schema';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { ReferralsService } from '../referrals/referrals.service';
import { PaymentsService } from '../payments/payments.service';
import { PromotionsService } from '../promotions/promotions.service';
import { AccessControlService } from '../../common/services/access-control.service';
import { isOpenNow } from '../restaurants/restaurants.service';

const money = (n: number) => Math.round(n * 100) / 100;

export const ACTIVE_STATUSES = [
  OrderStatus.PLACED,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.OUT_FOR_DELIVERY,
];

const FLOW: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PLACED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

const STATUS_COPY: Record<string, string> = {
  confirmed: 'The restaurant accepted your order.',
  preparing: 'Your food is being prepared.',
  ready: 'Your order is ready.',
  out_for_delivery: 'Your order is on its way.',
  delivered: 'Your order is complete. Enjoy!',
  cancelled: 'Your order was cancelled.',
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notifications: NotificationsService,
    private loyalty: LoyaltyService,
    private referrals: ReferralsService,
    private payments: PaymentsService,
    private promotions: PromotionsService,
    private access: AccessControlService,
  ) {}

  // ── Pricing ───────────────────────────────────────────────────────────────
  /** Builds a fully server-priced order. Nothing here trusts client-sent prices. */
  private async price(customerId: string, data: any) {
    const restaurant = await this.restaurantModel.findById(data.restaurantId);
    if (!restaurant || restaurant.status !== RestaurantStatus.ACTIVE) throw new NotFoundException('Restaurant not found');
    if (restaurant.acceptingOrders === false) throw new BadRequestException('This restaurant is not accepting orders right now');
    if (!isOpenNow(restaurant.openingHours)) throw new BadRequestException('This restaurant is currently closed');

    const type: OrderType = data.orderType;
    if (type === OrderType.DELIVERY && !restaurant.delivery) throw new BadRequestException('This restaurant does not offer delivery');
    if (type === OrderType.PICKUP && !restaurant.pickup) throw new BadRequestException('This restaurant does not offer pickup');
    if (type === OrderType.DINE_IN && !restaurant.dineIn) throw new BadRequestException('This restaurant does not offer dine-in ordering');

    const merged = new Map<string, { quantity: number; notes?: string }>();
    for (const line of data.items) {
      const cur = merged.get(line.menuItemId);
      merged.set(line.menuItemId, { quantity: (cur?.quantity || 0) + line.quantity, notes: line.notes || cur?.notes });
    }
    const dishes = await this.menuItemModel.find({ _id: { $in: [...merged.keys()] }, restaurantId: restaurant._id });
    if (dishes.length !== merged.size) throw new BadRequestException('Some items are no longer on this restaurant\'s menu');

    const items = dishes.map((d) => {
      if (!d.isAvailable || d.isSoldOut) throw new BadRequestException(`"${d.name}" is currently unavailable`);
      const line = merged.get(d._id.toString())!;
      return {
        menuItemId: d._id,
        name: d.name,
        price: d.price,
        quantity: line.quantity,
        image: d.image || null,
        notes: line.notes || null,
      };
    });

    const subtotal = money(items.reduce((s, i) => s + i.price * i.quantity, 0));
    if (type === OrderType.DELIVERY && restaurant.minOrder > 0 && subtotal < restaurant.minOrder) {
      throw new BadRequestException(`Minimum order for delivery is $${restaurant.minOrder.toFixed(2)}`);
    }

    let deliveryFee = type === OrderType.DELIVERY ? money(restaurant.deliveryFee || 0) : 0;
    let discount = 0;
    let promoCode: string | null = null;
    let voucherCode: string | null = null;
    let promoId: string | null = null;

    if (data.promoCode) {
      const code = String(data.promoCode).trim().toUpperCase();
      const voucher = await this.loyalty.findVoucher(customerId, code);
      if (voucher) {
        if (voucher.discountType === 'free_delivery') {
          if (type !== OrderType.DELIVERY) throw new BadRequestException('This reward only applies to delivery orders');
          deliveryFee = 0;
        } else if (voucher.discountType === 'percentage') {
          discount = money((subtotal * voucher.discountValue) / 100);
        } else {
          discount = money(Math.min(voucher.discountValue, subtotal));
        }
        promoCode = code;
        voucherCode = code;
      } else {
        const resolved = await this.promotions.resolveCode(restaurant._id.toString(), code, subtotal);
        if (!resolved) throw new BadRequestException('That promo code is not valid');
        discount = resolved.amount;
        promoCode = code;
        promoId = resolved.promo._id.toString();
      }
    }

    const tax = money((subtotal - discount) * (restaurant.taxRate ?? 0));
    const tip = money(Math.max(0, Number(data.tip) || 0));
    const total = money(subtotal - discount + deliveryFee + tax + tip);

    return { restaurant, items, subtotal, discount, promoCode, voucherCode, promoId, deliveryFee, tax, tip, total, type };
  }

  async quote(customerId: string, data: any) {
    const p = await this.price(customerId, data);
    return {
      subtotal: p.subtotal,
      discount: p.discount,
      promoCode: p.promoCode,
      deliveryFee: p.deliveryFee,
      tax: p.tax,
      tip: p.tip,
      total: p.total,
      taxRate: p.restaurant.taxRate,
      minOrder: p.restaurant.minOrder,
    };
  }

  // ── Create ────────────────────────────────────────────────────────────────
  async create(customerId: string, data: any) {
    const p = await this.price(customerId, data);
    const customer = await this.userModel.findById(customerId);
    if (!customer) throw new NotFoundException('User not found');

    if (p.type === OrderType.DELIVERY && !String(data.deliveryAddress || '').trim()) {
      throw new BadRequestException('A delivery address is required');
    }

    let cardLast4: string | null = null;
    if (data.paymentMethod === 'card') {
      const card = customer.paymentMethods?.[data.cardIndex ?? -1];
      if (!card) throw new BadRequestException('Choose a saved card to pay with');
      cardLast4 = card.last4;
    }

    let tableNumber: string | null = null;
    if (data.tableId) {
      const table = await this.tableModel.findOne({ _id: data.tableId, restaurantId: p.restaurant._id });
      if (!table) throw new BadRequestException('Invalid table');
      tableNumber = table.tableNumber;
    }

    const minutes = (p.restaurant.prepTime || 30) + (p.type === OrderType.DELIVERY ? 15 : 0);
    const now = new Date();
    const order: OrderDocument = await this.orderModel.create(<any>{
      orderNumber: 'ORD-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
      customerId,
      customerName: customer.fullName,
      customerPhone: data.phone || customer.phone || null,
      restaurantId: p.restaurant._id,
      restaurantName: p.restaurant.name,
      restaurantImage: p.restaurant.images?.[0] || null,
      items: p.items,
      subtotal: p.subtotal,
      discount: p.discount,
      promoCode: p.promoCode,
      deliveryFee: p.deliveryFee,
      tax: p.tax,
      tip: p.tip,
      total: p.total,
      orderType: p.type,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'card' ? 'paid' : 'pending',
      cardLast4,
      deliveryAddress: p.type === OrderType.DELIVERY ? String(data.deliveryAddress).trim() : null,
      notes: data.notes || null,
      tableId: data.tableId || null,
      tableNumber,
      estimatedDelivery: new Date(now.getTime() + minutes * 60000),
      status: OrderStatus.PLACED,
      statusHistory: [{ status: OrderStatus.PLACED, time: now, note: 'Order placed' }],
    });

    await this.payments.charge({
      userId: customerId,
      orderId: order._id.toString(),
      amount: order.total,
      method: data.paymentMethod,
      last4: cardLast4,
    });
    if (p.voucherCode) await this.loyalty.consumeVoucher(customerId, p.voucherCode);
    if (p.promoId) await this.promotions.markUsed(p.promoId);

    this.safely(async () => {
      await this.notifications.create(customerId, {
        title: 'Order placed',
        message: `Order ${order.orderNumber} from ${p.restaurant.name} is confirmed. Total $${order.total.toFixed(2)}.`,
        type: NotificationType.ORDER,
        link: `/my-orders/${order._id.toString()}/track`,
      });
      await this.notifications.create(p.restaurant.ownerId.toString(), {
        title: 'New order received',
        message: `${order.orderNumber} · ${p.items.reduce((s, i) => s + i.quantity, 0)} items · $${order.total.toFixed(2)} (${p.type.replace('_', ' ')})`,
        type: NotificationType.ORDER,
        link: '/owner/kitchen',
      });
    });

    return order;
  }

  private safely(fn: () => Promise<unknown>) {
    fn().catch(() => undefined);
  }

  // ── Reads ─────────────────────────────────────────────────────────────────
  private statusFilter(status?: string) {
    if (!status || status === 'all') return undefined;
    if (status === 'active') return { $in: ACTIVE_STATUSES };
    if (status === 'past') return { $in: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] };
    return { $in: status.split(',') };
  }

  private async paginate(filter: any, query: any, defaultLimit: number) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || defaultLimit));
    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.orderModel.countDocuments(filter),
    ]);
    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  async findAll(query: any = {}) {
    const filter: any = { restaurantId: new Types.ObjectId(query.restaurantId) };
    const status = this.statusFilter(query.status);
    if (status) filter.status = status;
    return this.paginate(filter, query, 20);
  }

  async findById(id: string) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  findByCustomer(customerId: string, query: any = {}) {
    const filter: any = { customerId: new Types.ObjectId(customerId) };
    const status = this.statusFilter(query.status);
    if (status) filter.status = status;
    return this.paginate(filter, query, 10);
  }

  findByRestaurant(restaurantId: string, query: any = {}) {
    return this.findAll({ ...query, restaurantId });
  }

  // ── Status changes ────────────────────────────────────────────────────────
  async updateStatus(id: string, status: OrderStatus, note?: string, actor?: any) {
    if (!Object.values(OrderStatus).includes(status)) throw new BadRequestException('Invalid status');
    const existing = await this.orderModel.findById(id);
    if (!existing) throw new NotFoundException('Order not found');
    if (actor) await this.access.assertRestaurantOwner(actor, existing.restaurantId.toString());
    return this.transition(existing, status, note);
  }

  private async transition(existing: OrderDocument, status: OrderStatus, note?: string) {
    const allowed = FLOW[existing.status];
    if (!allowed.includes(status)) {
      throw new BadRequestException(`Cannot move an order from "${existing.status}" to "${status}"`);
    }
    if (status === OrderStatus.OUT_FOR_DELIVERY && existing.orderType !== OrderType.DELIVERY) {
      throw new BadRequestException('Only delivery orders can be sent out for delivery');
    }

    const update: any = { status, $push: { statusHistory: { status, time: new Date(), note: note || '' } } };
    if (status === OrderStatus.DELIVERED && existing.paymentMethod === 'cash') update.paymentStatus = 'paid';
    if (status === OrderStatus.CANCELLED && existing.paymentStatus === 'paid') update.paymentStatus = 'refunded';

    const order = await this.orderModel.findOneAndUpdate({ _id: existing._id, status: existing.status }, update, { new: true });
    if (!order) throw new BadRequestException('This order was just updated — refresh and try again');

    const customerId = order.customerId.toString();
    this.safely(async () => {
      await this.notifications.create(customerId, {
        title: `Order ${status.replace(/_/g, ' ')}`,
        message: `${order.orderNumber || 'Your order'} · ${STATUS_COPY[status] || ''}`,
        type: NotificationType.ORDER,
        link: `/my-orders/${order._id.toString()}/track`,
      });
      if (status === OrderStatus.DELIVERED) {
        await this.payments.markPaid(order._id.toString());
        const points = Math.floor(order.total);
        await this.loyalty.addPoints(customerId, points, `Order ${order.orderNumber} at ${order.restaurantName}`);
        await this.referrals.completeForUser(customerId);
      }
      if (status === OrderStatus.CANCELLED && existing.paymentStatus === 'paid') {
        await this.payments.refund(order._id.toString());
      }
    });
    return order;
  }

  async cancel(id: string, user: any) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    if (user.role === 'owner') {
      await this.access.assertRestaurantOwner(user, order.restaurantId.toString());
      return this.transition(order, OrderStatus.CANCELLED, 'Cancelled by restaurant');
    }
    if (order.customerId.toString() !== user._id.toString()) throw new ForbiddenException('Cannot cancel this order');
    if (![OrderStatus.PLACED, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new BadRequestException('This order is already being prepared and can no longer be cancelled');
    }
    return this.transition(order, OrderStatus.CANCELLED, 'Cancelled by customer');
  }

  // ── Analytics ─────────────────────────────────────────────────────────────
  async getStats(restaurantId: string) {
    const rid = new Types.ObjectId(restaurantId);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [counts, revenue, today] = await Promise.all([
      this.orderModel.aggregate([{ $match: { restaurantId: rid } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
      this.orderModel.aggregate([
        { $match: { restaurantId: rid, status: OrderStatus.DELIVERED } },
        { $group: { _id: null, total: { $sum: '$total' }, n: { $sum: 1 } } },
      ]),
      this.orderModel.aggregate([
        { $match: { restaurantId: rid, createdAt: { $gte: startOfDay }, status: { $ne: OrderStatus.CANCELLED } } },
        { $group: { _id: null, total: { $sum: '$total' }, n: { $sum: 1 } } },
      ]),
    ]);
    const by = (s: OrderStatus) => counts.find((c) => c._id === s)?.n || 0;
    return {
      total: counts.reduce((s, c) => s + c.n, 0),
      delivered: by(OrderStatus.DELIVERED),
      cancelled: by(OrderStatus.CANCELLED),
      active: ACTIVE_STATUSES.reduce((s, st) => s + by(st), 0),
      revenue: revenue[0]?.total || 0,
      averageOrder: revenue[0]?.n ? money(revenue[0].total / revenue[0].n) : 0,
      todayOrders: today[0]?.n || 0,
      todayRevenue: today[0]?.total || 0,
    };
  }

  async getRevenueByDay(restaurantId: string, days = 7) {
    days = Math.min(90, Math.max(1, Number(days) || 7));
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));
    const rows = await this.orderModel.aggregate([
      { $match: { restaurantId: new Types.ObjectId(restaurantId), status: OrderStatus.DELIVERED, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);
    const byDay = new Map(rows.map((r) => [r._id, r]));
    const out: Array<{ _id: string; revenue: number; count: number }> = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      out.push({ _id: key, revenue: byDay.get(key)?.revenue || 0, count: byDay.get(key)?.count || 0 });
    }
    return out;
  }
}
