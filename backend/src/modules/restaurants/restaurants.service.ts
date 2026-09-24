import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument, RestaurantStatus } from './restaurant.schema';
import { User, UserDocument } from '../users/user.schema';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const escapeRegex = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const DEFAULT_HOURS = Object.fromEntries(
  DAYS.map((d) => [d, { open: '10:00', close: '22:00', closed: false }]),
);

/** Whether a restaurant is open right now, based on its weekly hours. */
export function isOpenNow(hours: Restaurant['openingHours'] | undefined, now = new Date()): boolean {
  const today = hours?.[DAYS[now.getDay()]];
  if (!today) return true; // no schedule configured → assume open
  if (today.closed) return false;
  const [oh, om] = String(today.open || '00:00').split(':').map(Number);
  const [ch, cm] = String(today.close || '23:59').split(':').map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  const open = oh * 60 + (om || 0);
  const close = ch * 60 + (cm || 0);
  return close > open ? mins >= open && mins < close : mins >= open || mins < close;
}

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private decorate(doc: RestaurantDocument | null) {
    if (!doc) return doc;
    const obj = doc.toObject() as any;
    obj.openNow = isOpenNow(obj.openingHours) && obj.acceptingOrders !== false;
    return obj;
  }

  async findPublic(query: any = {}) {
    const { search, cuisine, city, country, priceRange, sort, service, minRating } = query;
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(query.limit) || 12));
    const filter: any = { status: RestaurantStatus.ACTIVE };
    if (cuisine && cuisine !== 'all') filter.cuisineType = { $regex: `^${escapeRegex(String(cuisine))}$`, $options: 'i' };
    if (city) filter.city = { $regex: escapeRegex(String(city)), $options: 'i' };
    if (country) filter.country = { $regex: escapeRegex(String(country)), $options: 'i' };
    if (priceRange) filter.priceRange = { $in: String(priceRange).split(',') };
    if (minRating) filter.rating = { $gte: Number(minRating) || 0 };
    if (service === 'delivery') filter.delivery = true;
    if (service === 'dine_in') filter.dineIn = true;
    if (service === 'pickup') filter.pickup = true;
    if (search) {
      const rx = { $regex: escapeRegex(String(search)), $options: 'i' };
      filter.$or = [{ name: rx }, { cuisineType: rx }, { city: rx }, { country: rx }, { description: rx }];
    }

    const sortMap: Record<string, any> = {
      rating: { rating: -1, totalReviews: -1 },
      rating_asc: { rating: 1 },
      newest: { createdAt: -1 },
      name_asc: { name: 1 },
      popular: { totalReviews: -1, rating: -1 },
      price_asc: { priceRange: 1, rating: -1 },
      price_desc: { priceRange: -1, rating: -1 },
    };
    const sortObj = sortMap[sort] || sortMap.rating;

    const [restaurants, total] = await Promise.all([
      this.restaurantModel.find(filter).sort(sortObj).skip((page - 1) * limit).limit(limit),
      this.restaurantModel.countDocuments(filter),
    ]);
    return { restaurants: restaurants.map((r) => this.decorate(r)), total, page, pages: Math.ceil(total / limit) };
  }

  async featured(limit = 8) {
    const restaurants = await this.restaurantModel
      .find({ status: RestaurantStatus.ACTIVE })
      .sort({ rating: -1, totalReviews: -1 })
      .limit(Math.min(24, limit));
    return { restaurants: restaurants.map((r) => this.decorate(r)) };
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
    const [restaurants, cities] = await Promise.all([
      this.restaurantModel.countDocuments({ status: RestaurantStatus.ACTIVE }),
      this.restaurantModel.distinct('city', { status: RestaurantStatus.ACTIVE }),
    ]);
    const rated = await this.restaurantModel.aggregate([
      { $match: { status: RestaurantStatus.ACTIVE, totalReviews: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$rating' }, reviews: { $sum: '$totalReviews' } } },
    ]);
    return {
      restaurants,
      cities: cities.filter(Boolean).length,
      reviews: rated[0]?.reviews || 0,
      avgRating: rated[0]?.avg ? Math.round(rated[0].avg * 10) / 10 : 0,
    };
  }

  async findById(id: string) {
    const restaurant = await this.restaurantModel.findById(id);
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return this.decorate(restaurant);
  }

  async findPublicById(id: string) {
    const restaurant = await this.restaurantModel.findOne({ _id: id, status: RestaurantStatus.ACTIVE });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return this.decorate(restaurant);
  }

  async findByOwner(ownerId: string) {
    return this.restaurantModel.findOne({ ownerId });
  }

  async create(ownerId: string, data: any) {
    const existing = await this.restaurantModel.findOne({ ownerId });
    if (existing) throw new BadRequestException('You already have a registered restaurant');
    const restaurant = await this.restaurantModel.create({
      ...data,
      openingHours: data.openingHours && Object.keys(data.openingHours).length ? data.openingHours : DEFAULT_HOURS,
      ownerId,
      status: RestaurantStatus.ACTIVE,
      approvedAt: new Date(),
    });
    await this.userModel.findByIdAndUpdate(ownerId, { restaurantId: restaurant._id });
    return restaurant;
  }

  async update(id: string, ownerId: string, data: any) {
    const restaurant = await this.restaurantModel.findById(id);
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId.toString() !== ownerId) throw new ForbiddenException('You do not manage this restaurant');
    const allowed = [
      'name', 'description', 'cuisineType', 'address', 'city', 'country', 'phone', 'email', 'website',
      'priceRange', 'seatingCapacity', 'dineIn', 'delivery', 'pickup', 'acceptingOrders', 'deliveryFee',
      'minOrder', 'taxRate', 'prepTime', 'images', 'openingHours', 'logo',
    ];
    const update: Record<string, unknown> = {};
    for (const key of allowed) if (data[key] !== undefined) update[key] = data[key];
    return this.restaurantModel.findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' });
  }
}
