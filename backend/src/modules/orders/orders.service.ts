import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { Order, OrderDocument, OrderStatus, OrderType } from './order.schema';
import { MenuCategory, MenuCategoryDocument, MenuItem, MenuItemDocument } from '../menu/menu.schema';
import { Restaurant, RestaurantDocument, RestaurantStatus } from '../restaurants/restaurant.schema';
import { Table, TableDocument } from '../tables/table.schema';
import { User, UserDocument, UserRole } from '../users/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.schema';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { ReferralsService } from '../referrals/referrals.service';
import { PaymentsService } from '../payments/payments.service';
import { PromotionsService } from '../promotions/promotions.service';
import { BillingService } from '../billing/billing.service';
import { SettingsService } from '../settings/settings.service';
import { AccessControlService, Actor } from '../../common/services/access-control.service';
import { AuditService } from '../../common/audit/audit.service';
import { isOpenAt, startOfLocalDay } from '../../common/utils/time';
import { CreateOrderDto, OrdersQueryDto, QuoteOrderDto } from './dto/create-order.dto';

const money = (n: number) => Math.round(n * 100) / 100;
const MAX_ITEMS_PER_ORDER = 100;

export const ACTIVE_STATUSES = [
  OrderStatus.PLACED,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.OUT_FOR_DELIVERY,
];

/** The order lifecycle. `delivered` means complete (handed over, collected or served). */
export const ORDER_FLOW: Record<OrderStatus, OrderStatus[]> = {
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

type Priced = Awaited<ReturnType<OrdersService['price']>>;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger('Orders');

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    @InjectModel(MenuCategory.name) private categoryModel: Model<MenuCategoryDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notifications: NotificationsService,
    private loyalty: LoyaltyService,
    private referrals: ReferralsService,
    private payments: PaymentsService,
    private promotions: PromotionsService,
    private billing: BillingService,
    private settings: SettingsService,
    private access: AccessControlService,
    private audit: AuditService,
    private config: ConfigService,
  ) {}

  private tz(r: { timezone?: string | null }) {
    return r.timezone || this.config.get<string>('DEFAULT_TIMEZONE', 'UTC');
  }

  // ── Pricing ───────────────────────────────────────────────────────────────
  /**
   * Builds a fully server-priced order. The client sends only item ids and quantities; names,
   * prices, fees, discounts, tax and totals all come from the database and platform settings.
   */
  private async price(customerId: string, dto: QuoteOrderDto) {
    const settings = await this.settings.get();
    const restaurant = await this.restaurantModel.findOne({ _id: dto.restaurantId, status: RestaurantStatus.ACTIVE });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.acceptingOrders === false) throw new BadRequestException('This restaurant is not accepting orders right now');
    if (!isOpenAt(restaurant.openingHours, this.tz(restaurant))) throw new BadRequestException('This restaurant is currently closed');

    const type = dto.orderType as OrderType;
    if (type === OrderType.DELIVERY && !restaurant.delivery) throw new BadRequestException('This restaurant does not offer delivery');
    if (type === OrderType.PICKUP && !restaurant.pickup) throw new BadRequestException('This restaurant does not offer pickup');
    if (type === OrderType.DINE_IN && !restaurant.dineIn) throw new BadRequestException('This restaurant does not offer dine-in ordering');

    const merged = new Map<string, { quantity: number; notes?: string | null }>();
    for (const line of dto.items) {
      const cur = merged.get(line.menuItemId);
      merged.set(line.menuItemId, { quantity: (cur?.quantity || 0) + line.quantity, notes: line.notes || cur?.notes });
    }
    const totalQty = [...merged.values()].reduce((s, l) => s + l.quantity, 0);
    if (totalQty > MAX_ITEMS_PER_ORDER) throw new BadRequestException(`An order can contain at most ${MAX_ITEMS_PER_ORDER} items`);

    const dishes = await this.menuItemModel.find({ _id: { $in: [...merged.keys()] }, restaurantId: restaurant._id });
    if (dishes.length !== merged.size) throw new BadRequestException("Some items are no longer on this restaurant's menu");
    const categories = await this.categoryModel.find({ _id: { $in: dishes.map((d) => d.categoryId) } }).select('name');
    const categoryName = new Map(categories.map((c) => [c._id.toString(), c.name]));

    const items = dishes.map((d) => {
      if (!d.isAvailable || d.isSoldOut) throw new BadRequestException(`"${d.name}" is currently unavailable`);
      const line = merged.get(d._id.toString())!;
      return {
        menuItemId: d._id as Types.ObjectId,
        name: d.name,
        price: d.price,
        quantity: line.quantity,
        image: d.image || null,
        notes: line.notes || null,
        categoryId: d.categoryId.toString(),
      };
    });

    const subtotal = money(items.reduce((s, i) => s + i.price * i.quantity, 0));
    if (type === OrderType.DELIVERY && restaurant.minOrder > 0 && subtotal < restaurant.minOrder) {
      throw new BadRequestException(`Minimum order for delivery is ${restaurant.minOrder} ${settings.currency}`);
    }

    let deliveryFee = type === OrderType.DELIVERY ? money(restaurant.deliveryFee || 0) : 0;
    let discount = 0;
    let promoCode: string | null = null;
    let voucherCode: string | null = null;
    let promotionId: Types.ObjectId | null = null;

    const code = dto.promoCode ? dto.promoCode.trim().toUpperCase() : null;
    const voucher = code ? await this.loyalty.findVoucher(customerId, code) : null;
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
      const lines = items.map((i) => ({ ...i, categoryName: categoryName.get(i.categoryId) }));
      const resolved = await this.promotions.resolve(restaurant._id.toString(), code, lines, subtotal, settings.currency);
      if (code && !resolved) throw new BadRequestException('That promo code is not valid');
      if (resolved) {
        discount = Math.min(resolved.amount, subtotal);
        promoCode = resolved.promo.code || null;
        promotionId = resolved.promo._id as Types.ObjectId;
      }
    }

    const foodNet = money(subtotal - discount);
    const serviceFee = SettingsService.serviceFee(settings, foodNet);
    const tax = money(foodNet * (restaurant.taxRate ?? 0));
    const tip = money(Math.max(0, dto.tip || 0));
    const total = money(foodNet + deliveryFee + serviceFee + tax + tip);
    const commissionRate = SettingsService.commissionRate(settings, restaurant);
    const commissionAmount = money(foodNet * commissionRate);

    return {
      restaurant,
      items: items.map(({ categoryId: _c, ...rest }) => rest),
      subtotal,
      discount,
      promoCode,
      voucherCode,
      promotionId,
      deliveryFee,
      serviceFee,
      tax,
      tip,
      total,
      type,
      currency: settings.currency,
      commissionRate,
      commissionAmount,
    };
  }

  async quote(customerId: string, dto: QuoteOrderDto) {
    const p = await this.price(customerId, dto);
    return {
      subtotal: p.subtotal,
      discount: p.discount,
      promoCode: p.promoCode,
      deliveryFee: p.deliveryFee,
      serviceFee: p.serviceFee,
      tax: p.tax,
      tip: p.tip,
      total: p.total,
      currency: p.currency,
      taxRate: p.restaurant.taxRate,
      minOrder: p.restaurant.minOrder,
    };
  }

  // ── Create ────────────────────────────────────────────────────────────────
  /**
   * Places an order. Without multi-document transactions (standalone MongoDB), consistency comes
   * from ordering: scarce resources (voucher, promo usage) are claimed atomically first, the order
   * is written next, and every earlier step is compensated if a later one fails.
   */
  async create(customer: Actor, dto: CreateOrderDto, idempotencyKey?: string) {
    const customerId = customer._id.toString();
    const requestKey = idempotencyKey || dto.clientRequestId;
    if (requestKey) {
      const existing = await this.orderModel.findOne({ customerId, clientRequestId: requestKey });
      if (existing) return existing;
    }

    if (dto.paymentMethod === 'card' && !this.payments.cardPaymentsEnabled()) {
      throw new BadRequestException('Online card payments are not available yet. Please choose cash.');
    }

    const p = await this.price(customerId, dto);
    const user = await this.userModel.findById(customerId);
    if (!user) throw new NotFoundException('User not found');

    if (p.type === OrderType.DELIVERY && !dto.deliveryAddress) throw new BadRequestException('A delivery address is required');

    let tableNumber: string | null = null;
    if (dto.tableId) {
      if (p.type !== OrderType.DINE_IN) throw new BadRequestException('A table can only be set on dine-in orders');
      const table = await this.tableModel.findOne({ _id: dto.tableId, restaurantId: p.restaurant._id });
      if (!table) throw new BadRequestException('Invalid table');
      tableNumber = table.tableNumber;
    }

    // 1. Claim scarce discounts atomically.
    if (p.voucherCode && !(await this.loyalty.claimVoucher(customerId, p.voucherCode))) {
      throw new ConflictException('This reward has already been used');
    }
    if (p.promotionId && !(await this.promotions.claimUse(p.promotionId))) {
      if (p.voucherCode) await this.loyalty.restoreVoucher(customerId, p.voucherCode);
      throw new ConflictException('This promotion has just reached its usage limit');
    }
    const compensate = async () => {
      if (p.voucherCode) await this.loyalty.restoreVoucher(customerId, p.voucherCode).catch(() => undefined);
      if (p.promotionId) await this.promotions.releaseUse(p.promotionId).catch(() => undefined);
    };

    // 2. Write the order.
    let order: OrderDocument;
    try {
      order = await this.insertOrder(customerId, user, p, dto, tableNumber, requestKey);
    } catch (err) {
      await compensate();
      if ((err as { code?: number }).code === 11000 && requestKey) {
        const existing = await this.orderModel.findOne({ customerId, clientRequestId: requestKey });
        if (existing) return existing;
      }
      throw err;
    }

    // 3. Open the payment record; undo everything if that fails.
    try {
      await this.payments.open({ userId: customerId, orderId: order._id.toString(), amount: order.total, currency: p.currency, method: dto.paymentMethod });
    } catch (err) {
      await this.orderModel.deleteOne({ _id: order._id });
      await compensate();
      throw err;
    }

    this.logger.log(`order.created id=${order._id.toString()} number=${order.orderNumber} restaurant=${p.restaurant._id.toString()} total=${order.total} ${p.currency}`);
    this.safely(async () => {
      await this.notifications.create(customerId, {
        title: 'Order placed',
        message: `Order ${order.orderNumber} from ${p.restaurant.name}. Total ${order.total} ${p.currency}.`,
        type: NotificationType.ORDER,
        link: `/my-orders/${order._id.toString()}/track`,
      });
      await this.notifications.create(p.restaurant.ownerId.toString(), {
        title: 'New order received',
        message: `${order.orderNumber} · ${p.items.reduce((s, i) => s + i.quantity, 0)} items · ${order.total} ${p.currency} (${p.type.replace('_', ' ')})`,
        type: NotificationType.ORDER,
        link: '/owner/kitchen',
      });
    });
    return this.orderModel.findById(order._id);
  }

  private async insertOrder(customerId: string, user: UserDocument, p: Priced, dto: CreateOrderDto, tableNumber: string | null, requestKey?: string) {
    const minutes = (p.restaurant.prepTime || 30) + (p.type === OrderType.DELIVERY ? 15 : 0);
    const now = new Date();
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.orderModel.create({
          orderNumber: 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
          clientRequestId: requestKey,
          customerId,
          customerName: user.fullName,
          customerPhone: dto.phone || user.phone || null,
          restaurantId: p.restaurant._id,
          restaurantName: p.restaurant.name,
          restaurantImage: p.restaurant.images?.[0] || null,
          items: p.items,
          subtotal: p.subtotal,
          discount: p.discount,
          promoCode: p.promoCode,
          deliveryFee: p.deliveryFee,
          serviceFee: p.serviceFee,
          tax: p.tax,
          tip: p.tip,
          total: p.total,
          currency: p.currency,
          commissionRate: p.commissionRate,
          commissionAmount: p.commissionAmount,
          voucherCode: p.voucherCode,
          promotionId: p.promotionId,
          orderType: p.type,
          paymentMethod: dto.paymentMethod,
          paymentStatus: 'pending',
          deliveryAddress: p.type === OrderType.DELIVERY ? dto.deliveryAddress : null,
          notes: dto.notes || null,
          tableId: dto.tableId || null,
          tableNumber,
          estimatedDelivery: new Date(now.getTime() + minutes * 60000),
          status: OrderStatus.PLACED,
          statusHistory: [{ status: OrderStatus.PLACED, time: now, note: 'Order placed', by: 'customer' }],
        });
      } catch (err) {
        // Retry only an order-number collision; anything else (incl. idempotency key) propagates.
        const dupOrderNumber = (err as { code?: number; keyPattern?: object }).code === 11000 && 'orderNumber' in ((err as { keyPattern?: object }).keyPattern || {});
        if (!dupOrderNumber || attempt >= 3) throw err;
      }
    }
  }

  private safely(fn: () => Promise<unknown>) {
    fn().catch((err) => this.logger.warn(`side effect failed: ${(err as Error).message}`));
  }

  // ── Reads ─────────────────────────────────────────────────────────────────
  private statusFilter(status?: string) {
    if (!status || status === 'all') return undefined;
    if (status === 'active') return { $in: ACTIVE_STATUSES };
    if (status === 'past') return { $in: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] };
    return { $in: status.split(',') };
  }

  private async paginate(filter: Record<string, unknown>, query: OrdersQueryDto, defaultLimit: number) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || defaultLimit));
    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.orderModel.countDocuments(filter),
    ]);
    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  findForRestaurant(restaurantId: string, query: OrdersQueryDto) {
    const filter: Record<string, unknown> = { restaurantId: new Types.ObjectId(restaurantId) };
    const status = this.statusFilter(query.status);
    if (status) filter.status = status;
    return this.paginate(filter, query, 20);
  }

  findByCustomer(customerId: string, query: OrdersQueryDto) {
    const filter: Record<string, unknown> = { customerId: new Types.ObjectId(customerId) };
    const status = this.statusFilter(query.status);
    if (status) filter.status = status;
    return this.paginate(filter, query, 10);
  }

  /** The customer who placed it, the restaurant that received it, or an admin. Anyone else gets 404. */
  async findVisible(user: Actor, id: string) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    if (order.customerId.toString() === user._id.toString()) return order;
    if (await this.access.managesRestaurant(user, order.restaurantId.toString())) return order;
    throw new NotFoundException('Order not found');
  }

  // ── Status changes ────────────────────────────────────────────────────────
  async updateStatus(actor: Actor, id: string, status: OrderStatus, note?: string | null) {
    const existing = await this.orderModel.findById(id).select('+voucherCode +promotionId +commissionRate +commissionAmount');
    if (!existing) throw new NotFoundException('Order not found');
    await this.access.assertRestaurantOwner(actor, existing.restaurantId.toString());
    return this.transition(existing, status, note, actor.role === UserRole.ADMIN ? 'admin' : 'restaurant', actor);
  }

  async cancel(user: Actor, id: string) {
    const order = await this.orderModel.findById(id).select('+voucherCode +promotionId +commissionRate +commissionAmount');
    if (!order) throw new NotFoundException('Order not found');

    if (order.customerId.toString() === user._id.toString() && user.role === UserRole.CUSTOMER) {
      if (![OrderStatus.PLACED, OrderStatus.CONFIRMED].includes(order.status)) {
        throw new BadRequestException('This order is already being prepared and can no longer be cancelled');
      }
      return this.transition(order, OrderStatus.CANCELLED, 'Cancelled by customer', 'customer', user);
    }
    if (!(await this.access.managesRestaurant(user, order.restaurantId.toString()))) {
      if (user.role === UserRole.CUSTOMER) throw new ForbiddenException('You cannot cancel this order');
      throw new NotFoundException('Order not found');
    }
    return this.transition(order, OrderStatus.CANCELLED, 'Cancelled by restaurant', user.role === UserRole.ADMIN ? 'admin' : 'restaurant', user);
  }

  private async transition(existing: OrderDocument, status: OrderStatus, note: string | null | undefined, by: string, actor: Actor) {
    if (!ORDER_FLOW[existing.status].includes(status)) {
      throw new BadRequestException(`Cannot move an order from "${existing.status}" to "${status}"`);
    }
    if (status === OrderStatus.OUT_FOR_DELIVERY && existing.orderType !== OrderType.DELIVERY) {
      throw new BadRequestException('Only delivery orders can be sent out for delivery');
    }

    const update: Record<string, unknown> = { status, $push: { statusHistory: { status, time: new Date(), note: note || '', by } } };
    if (status === OrderStatus.DELIVERED) update.paymentStatus = 'paid';
    if (status === OrderStatus.CANCELLED && existing.paymentStatus === 'paid') update.paymentStatus = 'refunded';

    // Conditional on the status we validated, so two racing updates cannot both apply.
    const order = await this.orderModel.findOneAndUpdate({ _id: existing._id, status: existing.status }, update, { returnDocument: 'after' });
    if (!order) throw new ConflictException('This order was just updated — refresh and try again');

    this.logger.log(`order.status id=${order._id.toString()} ${existing.status}->${status} by=${by}`);
    if (by === 'admin') await this.audit.record(actor, 'admin.order_status', { type: 'order', id: order._id }, { from: existing.status, to: status });

    const customerId = order.customerId.toString();
    if (status === OrderStatus.DELIVERED) {
      await this.payments.settle(order._id.toString());
      await this.billing.recordOrderRevenue({ ...existing.toObject(), _id: existing._id });
      const { loyaltyPointsPerUnit } = await this.settings.get();
      this.safely(() => this.loyalty.addPoints(customerId, Math.floor(order.total * loyaltyPointsPerUnit), `Order ${order.orderNumber} at ${order.restaurantName}`));
      this.safely(() => this.referrals.completeForUser(customerId));
    }
    if (status === OrderStatus.CANCELLED) {
      await this.payments.cancel(order._id.toString());
      if (existing.voucherCode) await this.loyalty.restoreVoucher(customerId, existing.voucherCode);
      if (existing.promotionId) await this.promotions.releaseUse(existing.promotionId);
    }
    this.safely(() =>
      this.notifications.create(customerId, {
        title: `Order ${status.replace(/_/g, ' ')}`,
        message: `${order.orderNumber || 'Your order'} · ${STATUS_COPY[status] || ''}`,
        type: NotificationType.ORDER,
        link: `/my-orders/${order._id.toString()}/track`,
      }),
    );
    if (by === 'customer') {
      this.safely(async () => {
        const r = await this.restaurantModel.findById(order.restaurantId).select('ownerId');
        if (r) {
          await this.notifications.create(r.ownerId.toString(), {
            title: 'Order cancelled',
            message: `${order.orderNumber} was cancelled by the customer.`,
            type: NotificationType.ORDER,
            link: '/owner/kitchen',
          });
        }
      });
    }
    return order;
  }

  /**
   * Administrative correction, outside the normal flow and always audited:
   * - mark an active order `delivered` (e.g. the restaurant forgot to close it), or
   * - cancel any order, including a delivered one (refund / fraud); its platform charges are voided.
   * Loyalty points already awarded are not clawed back.
   */
  async adminCorrect(actor: Actor, id: string, status: OrderStatus.DELIVERED | OrderStatus.CANCELLED, note: string) {
    const existing = await this.orderModel.findById(id).select('+voucherCode +promotionId +commissionRate +commissionAmount');
    if (!existing) throw new NotFoundException('Order not found');
    if (existing.status === status) throw new BadRequestException(`Order is already ${status}`);
    if (status === OrderStatus.DELIVERED && !ACTIVE_STATUSES.includes(existing.status)) {
      throw new BadRequestException('Only an active order can be marked delivered');
    }
    if (ORDER_FLOW[existing.status].includes(status)) return this.transition(existing, status, `Admin: ${note}`, 'admin', actor);

    // delivered → cancelled: the only move not in the normal flow.
    const order = await this.orderModel.findOneAndUpdate(
      { _id: existing._id, status: existing.status },
      {
        status,
        paymentStatus: existing.paymentStatus === 'paid' ? 'refunded' : existing.paymentStatus,
        $push: { statusHistory: { status, time: new Date(), note: `Admin correction: ${note}`, by: 'admin' } },
      },
      { returnDocument: 'after' },
    );
    if (!order) throw new ConflictException('This order was just updated — refresh and try again');
    await this.payments.cancel(order._id.toString());
    const voided = await this.billing.voidForSource(order._id.toString(), `Order cancelled by admin: ${note}`);
    await this.audit.record(actor, 'admin.order_corrected', { type: 'order', id: order._id }, { from: existing.status, to: status, note, voidedCharges: voided });
    return order;
  }

  /** Re-creates any missing revenue entries for delivered orders (idempotent). */
  async reconcileRevenue(sinceDays = 90) {
    let checked = 0;
    const cursor = this.orderModel
      .find({ status: OrderStatus.DELIVERED, updatedAt: { $gte: new Date(Date.now() - sinceDays * 86400000) } })
      .select('+commissionRate +commissionAmount')
      .cursor();
    for await (const order of cursor) {
      await this.billing.recordOrderRevenue(order);
      checked++;
    }
    return { ordersChecked: checked };
  }

  // ── Dashboard data ────────────────────────────────────────────────────────
  async getStats(restaurantId: string) {
    const restaurant = await this.restaurantModel.findById(restaurantId).select('timezone');
    const rid = new Types.ObjectId(restaurantId);
    const startOfDay = startOfLocalDay(this.tz(restaurant || {}));
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
      revenue: money(revenue[0]?.total || 0),
      averageOrder: revenue[0]?.n ? money(revenue[0].total / revenue[0].n) : 0,
      todayOrders: today[0]?.n || 0,
      todayRevenue: money(today[0]?.total || 0),
    };
  }

  async getRevenueByDay(restaurantId: string, days = 7) {
    days = Math.min(90, Math.max(1, days));
    const restaurant = await this.restaurantModel.findById(restaurantId).select('timezone');
    const timezone = this.tz(restaurant || {});
    const since = new Date(startOfLocalDay(timezone).getTime() - (days - 1) * 86400000);
    const rows = await this.orderModel.aggregate([
      { $match: { restaurantId: new Types.ObjectId(restaurantId), status: OrderStatus.DELIVERED, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);
    const byDay = new Map(rows.map((r) => [r._id, r]));
    return Array.from({ length: days }, (_, i) => {
      const key = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date(since.getTime() + i * 86400000 + 12 * 3600000));
      return { _id: key, revenue: money(byDay.get(key)?.revenue || 0), count: byDay.get(key)?.count || 0 };
    });
  }
}
