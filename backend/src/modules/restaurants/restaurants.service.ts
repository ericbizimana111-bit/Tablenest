import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { PRIVATE_RESTAURANT_FIELDS, Restaurant, RestaurantDocument, RestaurantStatus } from './restaurant.schema';
import { User, UserDocument } from '../users/user.schema';
import { CreateRestaurantDto, PublicRestaurantQueryDto, UpdateRestaurantDto } from './dto/restaurant.dto';
import { DEFAULT_HOURS, isOpenAt } from '../../common/utils/time';
import { escapeRegex } from '../../common/dto/pagination.dto';
import { AccessControlService, Actor } from '../../common/services/access-control.service';
import { UploadsService } from '../uploads/uploads.service';
import { SettingsService } from '../settings/settings.service';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class RestaurantsService {
  private readonly logger = new Logger('Restaurants');

  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private access: AccessControlService,
    private uploads: UploadsService,
    private settings: SettingsService,
    private audit: AuditService,
    private config: ConfigService,
  ) {}

  timezoneOf(r: { timezone?: string | null }) {
    return r.timezone || this.config.get<string>('DEFAULT_TIMEZONE', 'UTC');
  }

  /** Adds live fields (openNow, sponsored). `publicView` also strips commercial/moderation data. */
  private present(doc: RestaurantDocument, publicView: boolean) {
    const obj = doc.toObject() as Record<string, any>;
    obj.openNow = isOpenAt(obj.openingHours, this.timezoneOf(obj)) && obj.acceptingOrders !== false;
    obj.sponsored = !!obj.sponsoredUntil && new Date(obj.sponsoredUntil) > new Date();
    if (publicView) for (const f of PRIVATE_RESTAURANT_FIELDS) delete obj[f];
    delete obj.__v;
    return obj;
  }

  async findPublic(query: PublicRestaurantQueryDto) {
    const { search, cuisine, city, country, priceRange, sort, service, minRating } = query;
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(48, Math.max(1, query.limit || 12));
    const filter: Record<string, any> = { status: RestaurantStatus.ACTIVE };
    if (cuisine && cuisine !== 'all') filter.cuisineType = { $regex: `^${escapeRegex(cuisine)}$`, $options: 'i' };
    if (city) filter.city = { $regex: escapeRegex(city), $options: 'i' };
    if (country) filter.country = { $regex: escapeRegex(country), $options: 'i' };
    if (priceRange) filter.priceRange = { $in: priceRange.split(',') };
    if (minRating) filter.rating = { $gte: minRating };
    if (service === 'delivery') filter.delivery = true;
    if (service === 'dine_in') filter.dineIn = true;
    if (service === 'pickup') filter.pickup = true;
    if (search) {
      const rx = { $regex: escapeRegex(search), $options: 'i' };
      filter.$or = [{ name: rx }, { cuisineType: rx }, { city: rx }, { country: rx }, { description: rx }];
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      rating: { rating: -1, totalReviews: -1 },
      rating_asc: { rating: 1 },
      newest: { createdAt: -1 },
      name_asc: { name: 1 },
      popular: { totalReviews: -1, rating: -1 },
      price_asc: { priceRange: 1, rating: -1 },
      price_desc: { priceRange: -1, rating: -1 },
    };
    const sortObj = sortMap[sort || 'rating'];

    const [restaurants, total] = await Promise.all([
      this.restaurantModel.find(filter).sort({ ...sortObj, _id: 1 }).skip((page - 1) * limit).limit(limit),
      this.restaurantModel.countDocuments(filter),
    ]);
    return { restaurants: restaurants.map((r) => this.present(r, true)), total, page, pages: Math.ceil(total / limit) };
  }

  /** Sponsored placements first (paid), then the best-rated restaurants. */
  async featured(limit = 8) {
    limit = Math.min(24, Math.max(1, limit));
    const now = new Date();
    const sponsored = await this.restaurantModel
      .find({ status: RestaurantStatus.ACTIVE, sponsoredUntil: { $gt: now } })
      .sort({ rating: -1 })
      .limit(limit);
    const rest = await this.restaurantModel
      .find({ status: RestaurantStatus.ACTIVE, _id: { $nin: sponsored.map((r) => r._id) } })
      .sort({ rating: -1, totalReviews: -1 })
      .limit(limit - sponsored.length);
    return { restaurants: [...sponsored, ...rest].map((r) => this.present(r, true)) };
  }

  async cuisines() {
    const rows = await this.restaurantModel.aggregate([
      { $match: { status: RestaurantStatus.ACTIVE } },
      { $group: { _id: '$cuisineType', count: { $sum: 1 }, image: { $first: { $arrayElemAt: ['$images', 0] } } } },
      { $sort: { count: -1, _id: 1 } },
    ]);
    return rows.map((r) => ({ name: r._id, count: r.count, image: r.image || null }));
  }

  async platformStats() {
    const [restaurants, cities, rated] = await Promise.all([
      this.restaurantModel.countDocuments({ status: RestaurantStatus.ACTIVE }),
      this.restaurantModel.distinct('city', { status: RestaurantStatus.ACTIVE }),
      this.restaurantModel.aggregate([
        { $match: { status: RestaurantStatus.ACTIVE, totalReviews: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$rating' }, reviews: { $sum: '$totalReviews' } } },
      ]),
    ]);
    return {
      restaurants,
      cities: cities.filter(Boolean).length,
      reviews: rated[0]?.reviews || 0,
      avgRating: rated[0]?.avg ? Math.round(rated[0].avg * 10) / 10 : 0,
    };
  }

  /** Owner/admin view of any restaurant they manage, whatever its status. */
  async findManaged(user: Actor, id: string) {
    const restaurant = await this.access.assertRestaurantOwner(user, id);
    return this.present(restaurant, false);
  }

  async findPublicById(id: string) {
    const restaurant = await this.restaurantModel.findOne({ _id: id, status: RestaurantStatus.ACTIVE });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return this.present(restaurant, true);
  }

  async findByOwner(ownerId: string) {
    const restaurant = await this.restaurantModel.findOne({ ownerId });
    return restaurant ? this.present(restaurant, false) : null;
  }

  async create(user: Actor, dto: CreateRestaurantDto) {
    const ownerId = user._id.toString();
    if (await this.restaurantModel.exists({ ownerId })) throw new ConflictException('You already have a registered restaurant');
    await this.uploads.assertUsable(user, [...(dto.images || []), dto.logo]);

    const { requireRestaurantApproval } = await this.settings.get();
    const status = requireRestaurantApproval ? RestaurantStatus.PENDING : RestaurantStatus.ACTIVE;
    const restaurant = await this.restaurantModel.create({
      ...dto,
      openingHours: dto.openingHours && Object.keys(dto.openingHours).length ? dto.openingHours : DEFAULT_HOURS,
      ownerId,
      status,
      approvedAt: status === RestaurantStatus.ACTIVE ? new Date() : null,
    });
    await this.userModel.updateOne({ _id: ownerId }, { restaurantId: restaurant._id });
    await this.audit.record(user, 'restaurant.created', { type: 'restaurant', id: restaurant._id }, { status });
    return this.present(restaurant, false);
  }

  async update(user: Actor, id: string, dto: UpdateRestaurantDto) {
    const restaurant = await this.access.assertRestaurantOwner(user, id);
    const currentImages = [...(restaurant.images || []), restaurant.logo];
    await this.uploads.assertUsable(user, [...(dto.images || []), dto.logo], currentImages);

    const updated = await this.restaurantModel.findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after', runValidators: true });
    const stillUsed = new Set([...(updated!.images || []), updated!.logo]);
    await this.uploads.releaseIfUnused(currentImages.filter((u) => u && !stillUsed.has(u)));
    if (this.access.isAdmin(user)) {
      await this.audit.record(user, 'admin.restaurant_updated', { type: 'restaurant', id }, { fields: Object.keys(dto) });
    }
    return this.present(updated!, false);
  }
}
