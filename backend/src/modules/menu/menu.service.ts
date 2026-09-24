import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuItem, MenuItemDocument, MenuCategory, MenuCategoryDocument } from './menu.schema';
import { Order, OrderDocument } from '../orders/order.schema';
import { Restaurant, RestaurantDocument, RestaurantStatus } from '../restaurants/restaurant.schema';
import { AccessControlService } from '../../common/services/access-control.service';

const escapeRegex = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pick = (data: any, keys: string[]) => {
  const out: Record<string, unknown> = {};
  for (const k of keys) if (data?.[k] !== undefined) out[k] = data[k];
  return out;
};

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    @InjectModel(MenuCategory.name) private categoryModel: Model<MenuCategoryDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    private access: AccessControlService,
  ) {}

  // ── Categories ────────────────────────────────────────────────────────────
  getCategories(restaurantId: string) {
    return this.categoryModel.find({ restaurantId }).sort({ sortOrder: 1, createdAt: 1 });
  }

  async createCategory(user: any, data: any) {
    const restaurantId = await this.access.getOwnerRestaurantId(user);
    const name = String(data?.name || '').trim();
    if (!name) throw new BadRequestException('Category name is required');
    const count = await this.categoryModel.countDocuments({ restaurantId });
    return this.categoryModel.create({ name, restaurantId, sortOrder: data.sortOrder ?? count + 1 });
  }

  private async ownedCategory(user: any, id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    await this.access.assertRestaurantOwner(user, category.restaurantId.toString());
    return category;
  }

  async updateCategory(user: any, id: string, data: any) {
    await this.ownedCategory(user, id);
    return this.categoryModel.findByIdAndUpdate(id, { $set: pick(data, ['name', 'sortOrder']) }, { returnDocument: 'after' });
  }

  async deleteCategory(user: any, id: string) {
    await this.ownedCategory(user, id);
    const items = await this.menuItemModel.countDocuments({ categoryId: id });
    if (items > 0) throw new BadRequestException('Move or delete the dishes in this category first');
    await this.categoryModel.findByIdAndDelete(id);
    return { message: 'Category deleted' };
  }

  // ── Items ─────────────────────────────────────────────────────────────────
  getItems(restaurantId: string, categoryId?: string) {
    const filter: any = { restaurantId };
    if (categoryId) filter.categoryId = categoryId;
    return this.menuItemModel.find(filter).sort({ createdAt: -1 });
  }

  async getItemById(id: string) {
    const item = await this.menuItemModel.findById(id);
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  private validateItem(data: any, partial = false) {
    const clean = pick(data, ['name', 'description', 'price', 'image', 'isAvailable', 'isSoldOut', 'tags', 'preparationTime', 'categoryId']);
    if (!partial || clean.name !== undefined) {
      if (!String(clean.name || '').trim()) throw new BadRequestException('Dish name is required');
      clean.name = String(clean.name).trim();
    }
    if (!partial || clean.price !== undefined) {
      const price = Number(clean.price);
      if (!Number.isFinite(price) || price < 0) throw new BadRequestException('Enter a valid price');
      clean.price = Math.round(price * 100) / 100;
    }
    if (clean.tags !== undefined && !Array.isArray(clean.tags)) clean.tags = [];
    return clean;
  }

  async createItem(user: any, data: any) {
    const restaurantId = await this.access.getOwnerRestaurantId(user);
    const clean = this.validateItem(data);
    if (!Types.ObjectId.isValid(String(clean.categoryId))) throw new BadRequestException('Choose a category');
    const category = await this.categoryModel.findOne({ _id: clean.categoryId, restaurantId } as any);
    if (!category) throw new BadRequestException('Category does not belong to your restaurant');
    return this.menuItemModel.create({ ...clean, restaurantId });
  }

  private async ownedItem(user: any, id: string) {
    const item = await this.menuItemModel.findById(id);
    if (!item) throw new NotFoundException('Menu item not found');
    await this.access.assertRestaurantOwner(user, item.restaurantId.toString());
    return item;
  }

  async updateItem(user: any, id: string, data: any) {
    const item = await this.ownedItem(user, id);
    const clean = this.validateItem(data, true);
    if (clean.categoryId) {
      const ok = await this.categoryModel.exists({ _id: clean.categoryId, restaurantId: item.restaurantId });
      if (!ok) throw new BadRequestException('Category does not belong to your restaurant');
    }
    return this.menuItemModel.findByIdAndUpdate(id, { $set: clean }, { returnDocument: 'after' });
  }

  async toggleAvailability(user: any, id: string) {
    const item = await this.ownedItem(user, id);
    return this.menuItemModel.findByIdAndUpdate(id, { isAvailable: !item.isAvailable }, { returnDocument: 'after' });
  }

  async deleteItem(user: any, id: string) {
    await this.ownedItem(user, id);
    await this.menuItemModel.findByIdAndDelete(id);
    return { message: 'Item deleted' };
  }

  // ── Public discovery ──────────────────────────────────────────────────────
  async getFullMenu(restaurantId: string) {
    const [categories, items] = await Promise.all([
      this.categoryModel.find({ restaurantId }).sort({ sortOrder: 1, createdAt: 1 }),
      this.menuItemModel.find({ restaurantId, isAvailable: true }).sort({ createdAt: 1 }),
    ]);
    return categories
      .map((cat) => ({
        ...cat.toObject(),
        items: items.filter((i) => i.categoryId.toString() === cat._id.toString()),
      }))
      .filter((c) => c.items.length > 0);
  }

  private async withRestaurants(items: MenuItemDocument[]) {
    const ids = [...new Set(items.map((i) => i.restaurantId.toString()))];
    const restaurants = await this.restaurantModel
      .find({ _id: { $in: ids }, status: RestaurantStatus.ACTIVE })
      .select('name city cuisineType rating');
    const byId = new Map(restaurants.map((r) => [r._id.toString(), r]));
    return items
      .filter((i) => byId.has(i.restaurantId.toString()))
      .map((i) => {
        const r = byId.get(i.restaurantId.toString())!;
        return { ...i.toObject(), restaurant: { _id: r._id, name: r.name, city: r.city, cuisineType: r.cuisineType, rating: r.rating } };
      });
  }

  async popularDishes(limit = 8) {
    limit = Math.min(24, Math.max(1, limit));
    const ranked = await this.orderModel.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.menuItemId', sold: { $sum: '$items.quantity' } } },
      { $sort: { sold: -1 } },
      { $limit: limit * 3 },
    ]);
    const rankedIds = ranked.map((r) => r._id).filter(Boolean);
    const soldMap = new Map(ranked.map((r) => [String(r._id), r.sold]));
    let items = await this.menuItemModel.find({ _id: { $in: rankedIds }, isAvailable: true, image: { $ne: null } });
    items.sort((a, b) => (soldMap.get(String(b._id)) || 0) - (soldMap.get(String(a._id)) || 0));

    if (items.length < limit) {
      const extra = await this.menuItemModel
        .find({ _id: { $nin: items.map((i) => i._id) }, isAvailable: true, image: { $ne: null } })
        .sort({ createdAt: -1 })
        .limit(limit * 2);
      items = [...items, ...extra];
    }
    const withR = await this.withRestaurants(items);
    return { dishes: withR.slice(0, limit).map((d) => ({ ...d, sold: soldMap.get(String(d._id)) || 0 })) };
  }

  async searchDishes(q: string) {
    const term = q.trim();
    if (term.length < 2) return { dishes: [] };
    const rx = { $regex: escapeRegex(term), $options: 'i' };
    const items = await this.menuItemModel
      .find({ isAvailable: true, $or: [{ name: rx }, { description: rx }, { tags: rx }] })
      .limit(20);
    return { dishes: await this.withRestaurants(items) };
  }
}
