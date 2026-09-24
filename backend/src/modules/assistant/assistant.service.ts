import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, isValidObjectId } from 'mongoose';
import Anthropic from '@anthropic-ai/sdk';
import { Restaurant, RestaurantDocument, RestaurantStatus } from '../restaurants/restaurant.schema';
import { MenuCategory, MenuCategoryDocument, MenuItem, MenuItemDocument } from '../menu/menu.schema';
import { Order, OrderDocument } from '../orders/order.schema';
import { Reservation, ReservationDocument, ACTIVE_RESERVATION_STATUSES } from '../reservations/reservation.schema';
import { ReservationsService } from '../reservations/reservations.service';
import { ACTIVE_STATUSES } from '../orders/orders.service';
import { SettingsService } from '../settings/settings.service';
import { escapeRegex } from '../../common/dto/pagination.dto';
import { isOpenAt, zonedNow } from '../../common/utils/time';
import type { Actor } from '../../common/services/access-control.service';
import { ASSISTANT_TOOLS } from './assistant.tools';

export const ANTHROPIC_CLIENT = Symbol('ANTHROPIC_CLIENT');
/** The slice of the SDK the concierge uses — lets tests substitute a scripted client. */
export type AssistantClient = { beta: { messages: { create: (params: Anthropic.Beta.MessageCreateParamsNonStreaming) => Promise<Anthropic.Beta.BetaMessage> } } };

export type ChatTurn = { role: 'user' | 'assistant'; content: string };
export type Suggestion = {
  _id: string;
  name: string;
  cuisineType: string;
  city: string | null;
  rating: number;
  priceRange: string;
  image: string | null;
  openNow: boolean;
};

const MAX_TOOL_ROUNDS = 6;
const PRICE_LEVELS = ['$', '$$', '$$$', '$$$$'];

@Injectable()
export class AssistantService {
  private readonly logger = new Logger('Concierge');

  constructor(
    @Inject(ANTHROPIC_CLIENT) private client: AssistantClient | null,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    @InjectModel(MenuCategory.name) private categoryModel: Model<MenuCategoryDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    private reservations: ReservationsService,
    private settings: SettingsService,
    private config: ConfigService,
  ) {}

  get enabled() {
    return this.client !== null;
  }

  private tz(r: { timezone?: string | null }) {
    return r.timezone || this.config.get<string>('DEFAULT_TIMEZONE', 'UTC');
  }

  private system(user: Actor | undefined, currency: string, path?: string) {
    const today = zonedNow(this.config.get<string>('DEFAULT_TIMEZONE', 'UTC'));
    return [
      'You are the TableNest concierge, the friendly host of a restaurant discovery, table-booking and food-ordering platform.',
      'Help visitors find somewhere to eat, understand menus, pick a time to book and use the platform. Answer the question that was actually asked.',
      '',
      'Ground every factual claim about restaurants, dishes, prices, hours or availability in tool results from this conversation. Never invent a restaurant, dish, price, opening time or free slot. If the tools return nothing suitable, say so plainly and suggest a nearby alternative search.',
      'You can only look things up. You cannot book tables, place or cancel orders, or change accounts — tell people exactly where to do it instead, with a link.',
      '',
      'How TableNest works (use when relevant):',
      '- Book a table: open the restaurant page, choose "Book a table", pick date, party size and a free time, confirm. The booking is pending until the restaurant confirms; the guest is notified. Manage it under [My bookings](/my-bookings).',
      '- Order food: open the restaurant menu, add dishes, check out choosing delivery, pickup or dine-in. Payment is cash (or card in person) at the restaurant or on delivery; online card payment is not available yet. Follow it under [My orders](/my-orders) — statuses go placed → accepted → preparing → ready → on the way (delivery) → completed.',
      '- Customers can cancel an order while it is placed or accepted, and cancel or reschedule a booking while pending or confirmed.',
      '- Rewards: completed orders and visits earn loyalty points, redeemable for vouchers under [Rewards](/rewards). Inviting friends earns points under [Invite friends](/referrals).',
      '- Restaurant owners list their restaurant at [For restaurants](/partner) and run everything from their dashboard.',
      `- Prices are in ${currency}.`,
      '',
      'Style: warm, concise, practical — like a good maître d’. Usually 2–6 short sentences or a brief list. Use **bold** for restaurant names and link them as [Name](/restaurants/<id>). Links must be site paths starting with "/"; never write full URLs.',
      '',
      `Today is ${today.date}. ${user ? `The visitor is signed in as a ${user.role}.` : 'The visitor is not signed in; get_my_activity will not work for them.'}${path ? ` They are on the page ${path}.` : ''}`,
    ].join('\n');
  }

  async chat(turns: ChatTurn[], user?: Actor, path?: string) {
    if (!this.client) throw new ServiceUnavailableException('The concierge is not available right now');
    const { currency } = await this.settings.get();
    const seen = new Map<string, Suggestion>();
    const messages: Anthropic.Beta.BetaMessageParam[] = turns.map((t) => ({ role: t.role, content: t.content }));
    const model = this.config.get<string>('ASSISTANT_MODEL') || 'claude-opus-5';

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      let response: Anthropic.Beta.BetaMessage;
      try {
        response = await this.client.beta.messages.create({
          model,
          max_tokens: 8000,
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          thinking: { type: 'adaptive' },
          output_config: { effort: 'low' },
          system: this.system(user, currency, path),
          tools: ASSISTANT_TOOLS,
          messages,
        });
      } catch (err) {
        if (err instanceof Anthropic.RateLimitError) {
          throw new ServiceUnavailableException('The concierge is very busy right now. Please try again in a minute.');
        }
        if (err instanceof Anthropic.APIError) {
          this.logger.error(`concierge.api_error status=${err.status} ${err.message}`);
          throw new ServiceUnavailableException('The concierge is not available right now');
        }
        throw err;
      }

      if (response.stop_reason === 'refusal') {
        return { reply: "I can't help with that one, but I'm happy to find you somewhere good to eat.", suggestions: [] };
      }

      const toolUses = response.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === 'tool_use');
      if (response.stop_reason !== 'tool_use' || toolUses.length === 0) {
        const reply = response.content
          .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('\n')
          .trim();
        return { reply: reply || 'Sorry — I lost my train of thought. Could you ask that again?', suggestions: this.mentioned(reply, seen) };
      }

      messages.push({ role: 'assistant', content: response.content });
      const results: Anthropic.Beta.BetaToolResultBlockParam[] = await Promise.all(
        toolUses.map(async (t) => {
          try {
            const out = await this.run(t.name, (t.input ?? {}) as Record<string, unknown>, user, seen);
            return { type: 'tool_result' as const, tool_use_id: t.id, content: JSON.stringify(out) };
          } catch (err) {
            return { type: 'tool_result' as const, tool_use_id: t.id, is_error: true, content: (err as Error).message || 'Tool failed' };
          }
        }),
      );
      messages.push({ role: 'user', content: results });
    }
    return { reply: 'That took more digging than I expected. Could you narrow it down a little — a cuisine, area or time?', suggestions: this.mentioned('', seen) };
  }

  /** Suggestion cards for the restaurants the reply actually talks about (by link or name). */
  private mentioned(reply: string, seen: Map<string, Suggestion>) {
    const text = reply.toLowerCase();
    return [...seen.values()].filter((s) => text.includes(`/restaurants/${s._id}`) || text.includes(s.name.toLowerCase())).slice(0, 4);
  }

  private remember(r: RestaurantDocument, seen: Map<string, Suggestion>) {
    const open = isOpenAt(r.openingHours, this.tz(r)) && r.acceptingOrders !== false;
    seen.set(r._id.toString(), {
      _id: r._id.toString(),
      name: r.name,
      cuisineType: r.cuisineType,
      city: r.city,
      rating: r.rating,
      priceRange: r.priceRange,
      image: r.images?.[0] || r.logo || null,
      openNow: open,
    });
    return open;
  }

  private async run(name: string, input: Record<string, unknown>, user: Actor | undefined, seen: Map<string, Suggestion>): Promise<unknown> {
    const str = (v: unknown, max = 100) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
    const int = (v: unknown, lo: number, hi: number, dflt: number) => (Number.isInteger(v) ? Math.min(hi, Math.max(lo, v as number)) : dflt);

    switch (name) {
      case 'search_restaurants': {
        const filter: Record<string, unknown> = { status: RestaurantStatus.ACTIVE };
        const query = str(input.query);
        const cuisine = str(input.cuisine, 50);
        const city = str(input.city, 80);
        if (cuisine) filter.cuisineType = { $regex: `^${escapeRegex(cuisine)}$`, $options: 'i' };
        if (city) filter.city = { $regex: escapeRegex(city), $options: 'i' };
        if (input.service === 'delivery') filter.delivery = true;
        if (input.service === 'pickup') filter.pickup = true;
        if (input.service === 'dine_in') filter.dineIn = true;
        if (Number.isInteger(input.max_price_level)) filter.priceRange = { $in: PRICE_LEVELS.slice(0, int(input.max_price_level, 1, 4, 4)) };
        if (query) {
          const rx = { $regex: escapeRegex(query), $options: 'i' };
          filter.$or = [{ name: rx }, { cuisineType: rx }, { city: rx }, { description: rx }];
        }
        const limit = int(input.limit, 1, 8, 5);
        const found = await this.restaurantModel.find(filter).sort({ rating: -1, totalReviews: -1 }).limit(input.open_now ? 40 : limit);
        const rows = found
          .map((r) => ({ r, open: this.remember(r, seen) }))
          .filter((x) => !input.open_now || x.open)
          .slice(0, limit)
          .map(({ r, open }) => ({
            id: r._id.toString(),
            name: r.name,
            cuisine: r.cuisineType,
            city: r.city,
            rating: r.rating,
            reviews: r.totalReviews,
            price: r.priceRange,
            open_now: open,
            services: [r.dineIn && 'table booking', r.delivery && 'delivery', r.pickup && 'pickup'].filter(Boolean),
            page: `/restaurants/${r._id.toString()}`,
          }));
        return { count: rows.length, restaurants: rows };
      }

      case 'get_restaurant_details': {
        const id = str(input.restaurant_id, 40);
        if (!id || !isValidObjectId(id)) throw new Error('Unknown restaurant id');
        const r = await this.restaurantModel.findOne({ _id: id, status: RestaurantStatus.ACTIVE });
        if (!r) throw new Error('Restaurant not found');
        const open = this.remember(r, seen);
        const [categories, items] = await Promise.all([
          this.categoryModel.find({ restaurantId: r._id }).sort({ sortOrder: 1 }),
          this.menuItemModel.find({ restaurantId: r._id, isAvailable: true }).limit(120),
        ]);
        return {
          id: r._id.toString(),
          name: r.name,
          description: r.description,
          cuisine: r.cuisineType,
          address: [r.address, r.city, r.country].filter(Boolean).join(', '),
          phone: r.phone,
          rating: r.rating,
          reviews: r.totalReviews,
          price: r.priceRange,
          open_now: open,
          timezone: this.tz(r),
          opening_hours: r.openingHours,
          services: { table_booking: r.dineIn, delivery: r.delivery, pickup: r.pickup, accepting_orders: r.acceptingOrders },
          delivery_fee: r.deliveryFee,
          minimum_delivery_order: r.minOrder,
          prep_minutes: r.prepTime,
          page: `/restaurants/${r._id.toString()}`,
          menu: categories
            .map((c) => ({
              category: c.name,
              dishes: items
                .filter((i) => i.categoryId.toString() === c._id.toString())
                .map((i) => ({ name: i.name, price: i.price, description: i.description, tags: i.tags, sold_out: i.isSoldOut })),
            }))
            .filter((c) => c.dishes.length),
        };
      }

      case 'search_dishes': {
        const q = str(input.query);
        if (!q || q.length < 2) throw new Error('Query must be at least 2 characters');
        const rx = { $regex: escapeRegex(q), $options: 'i' };
        const filter: Record<string, unknown> = { isAvailable: true, $or: [{ name: rx }, { description: rx }, { tags: rx }] };
        if (typeof input.max_price === 'number') filter.price = { $lte: input.max_price };
        const items = await this.menuItemModel.find(filter).limit(30);
        const restaurants = await this.restaurantModel.find({ _id: { $in: items.map((i) => i.restaurantId) }, status: RestaurantStatus.ACTIVE });
        const byId = new Map(restaurants.map((r) => [r._id.toString(), r]));
        const dishes = items
          .filter((i) => byId.has(i.restaurantId.toString()))
          .slice(0, 12)
          .map((i) => {
            const r = byId.get(i.restaurantId.toString())!;
            this.remember(r, seen);
            return { dish: i.name, price: i.price, description: i.description, restaurant: r.name, restaurant_id: r._id.toString(), page: `/restaurants/${r._id.toString()}?tab=menu` };
          });
        return { count: dishes.length, dishes };
      }

      case 'check_table_availability': {
        const id = str(input.restaurant_id, 40);
        const date = str(input.date, 10);
        if (!id || !isValidObjectId(id)) throw new Error('Unknown restaurant id');
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Date must be YYYY-MM-DD');
        const guests = int(input.guests, 1, 20, 2);
        const a = await this.reservations.getAvailability({ restaurantId: id, date, guests });
        const r = await this.restaurantModel.findById(id);
        if (r) this.remember(r, seen);
        return {
          date: a.date,
          guests: a.guests,
          closed_that_day: a.closed,
          free_times: a.slots.filter((s) => s.available).map((s) => s.time),
          book_at: `/restaurants/${id}?tab=book`,
        };
      }

      case 'get_my_activity': {
        if (!user) return { signed_in: false, note: 'Ask the visitor to sign in at /login to see their bookings and orders.' };
        const [bookings, orders] = await Promise.all([
          this.reservationModel
            .find({ customerId: user._id.toString(), status: { $in: ACTIVE_RESERVATION_STATUSES } })
            .sort({ date: 1 })
            .limit(5),
          this.orderModel
            .find({ customerId: user._id.toString(), status: { $in: ACTIVE_STATUSES } })
            .sort({ createdAt: -1 })
            .limit(5),
        ]);
        return {
          signed_in: true,
          upcoming_bookings: bookings.map((b) => ({ restaurant: b.restaurantName, date: b.date.toISOString().slice(0, 10), time: b.time, guests: b.guests, status: b.status, ref: b.bookingRef })),
          active_orders: orders.map((o) => ({ number: o.orderNumber, restaurant: o.restaurantName, status: o.status, total: o.total, type: o.orderType, track: `/my-orders/${o._id.toString()}/track` })),
        };
      }

      default:
        throw new Error(`Unknown tool ${name}`);
    }
  }
}
