import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuItem, MenuItemDocument, MenuCategory, MenuCategoryDocument } from './menu.schema';
import { Order, OrderDocument, OrderStatus } from '../orders/order.schema';
import { Restaurant, RestaurantDocument, RestaurantStatus } from '../restaurants/restaurant.schema';
import { AccessControlService, Actor } from '../../common/services/access-control.service';
import { UploadsService } from '../uploads/uploads.service';
import { escapeRegex } from '../../common/dto/pagination.dto';
import { CreateCategoryDto, CreateMenuItemDto, UpdateCategoryDto, UpdateMenuItemDto } from './menu.dto';

const MAX_MENU_ITEMS = 500;

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    @InjectModel(MenuCategory.name) private categoryModel: Model<MenuCategoryDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    private access: AccessControlService,
    private uploads: UploadsService,
  ) {}

  /** Whether the caller may see a restaurant's full (incl. unavailable / not-yet-live) menu. */
  private async canManage(user: Actor | undefined, restaurantId: string) {
    return !!user && (await this.access.managesRestaurant(user, restaurantId));
  }

  private async assertVisible(user: Actor | undefined, restaurantId: string) {
    if (await this.canManage(user, restaurantId)) return true;
    if (!(await this.restaurantModel.exists({ _id: restaurantId, status: RestaurantStatus.ACTIVE }))) {
      throw new NotFoundException('Restaurant not found');
    }
    return false;
  }

  // ── Categories ────────────────────────────────────────────────────────────
  async getCategories(user: Actor | undefined, restaurantId: string) {
    await this.assertVisible(user, restaurantId);
    return this.categoryModel.find({ restaurantId }).sort({ sortOrder: 1, createdAt: 1 });
  }

  async createCategory(user: Actor, dto: CreateCategoryDto) {
    const restaurantId = await this.access.getOwnerRestaurantId(user);
    if (await this.categoryModel.exists({ restaurantId, name: { $regex: `^${escapeRegex(dto.name)}$`, $options: 'i' } })) {
      throw new ConflictException('A category with this name already exists');
    }
    const count = await this.categoryModel.countDocuments({ restaurantId });
    return this.categoryModel.create({ name: dto.name, restaurantId, sortOrder: dto.sortOrder ?? count + 1 });
  }

  private async ownedCategory(user: Actor, id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    await this.access.assertRestaurantOwner(user, category.restaurantId.toString());
    return category;
  }

  async updateCategory(user: Actor, id: string, dto: UpdateCategoryDto) {
    await this.ownedCategory(user, id);
    return this.categoryModel.findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after' });
  }

  async deleteCategory(user: Actor, id: string) {
    await this.ownedCategory(user, id);
    if (await this.menuItemModel.exists({ categoryId: id })) {
      throw new ConflictException('Move or delete the dishes in this category first');
    }
    await this.categoryModel.findByIdAndDelete(id);
    return { message: 'Category deleted' };
  }

  // ── Items ─────────────────────────────────────────────────────────────────
  /** Managers get every dish; everyone else only what can currently be ordered. */
  async getItems(user: Actor | undefined, restaurantId: string, categoryId?: string) {
    const manager = await this.assertVisible(user, restaurantId);
    const filter: Record<string, unknown> = { restaurantId };
    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) throw new BadRequestException('Invalid categoryId');
      filter.categoryId = categoryId;
    }
    if (!manager) filter.isAvailable = true;
    return this.menuItemModel.find(filter).sort({ createdAt: -1 }).limit(MAX_MENU_ITEMS);
  }

  async getItemById(user: Actor | undefined, id: string) {
    const item = await this.menuItemModel.findById(id);
    if (!item) throw new NotFoundException('Menu item not found');
    const manager = await this.canManage(user, item.restaurantId.toString());
    if (!manager) {
      const live = await this.restaurantModel.exists({ _id: item.restaurantId, status: RestaurantStatus.ACTIVE });
      if (!live || !item.isAvailable) throw new NotFoundException('Menu item not found');
    }
    return item;
  }

  private async assertCategoryOf(categoryId: string, restaurantId: string | Types.ObjectId) {
    if (!(await this.categoryModel.exists({ _id: categoryId, restaurantId }))) {
      throw new BadRequestException('Category does not belong to your restaurant');
    }
  }

  async createItem(user: Actor, dto: CreateMenuItemDto) {
    const restaurantId = await this.access.getOwnerRestaurantId(user);
    await this.assertCategoryOf(dto.categoryId, restaurantId);
    if ((await this.menuItemModel.countDocuments({ restaurantId })) >= MAX_MENU_ITEMS) {
      throw new BadRequestException(`A menu can have at most ${MAX_MENU_ITEMS} dishes`);
    }
    await this.uploads.assertUsable(user, [dto.image]);
    return this.menuItemModel.create({ ...dto, restaurantId });
  }

  private async ownedItem(user: Actor, id: string) {
    const item = await this.menuItemModel.findById(id);
    if (!item) throw new NotFoundException('Menu item not found');
    await this.access.assertRestaurantOwner(user, item.restaurantId.toString());
    return item;
  }

  async updateItem(user: Actor, id: string, dto: UpdateMenuItemDto) {
    const item = await this.ownedItem(user, id);
    if (dto.categoryId) await this.assertCategoryOf(dto.categoryId, item.restaurantId);
    if (dto.image !== undefined) await this.uploads.assertUsable(user, [dto.image], [item.image]);
    const updated = await this.menuItemModel.findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after', runValidators: true });
    if (dto.image !== undefined && item.image && item.image !== updated!.image) await this.uploads.releaseIfUnused([item.image]);
    return updated;
  }

  async toggleAvailability(user: Actor, id: string) {
    const item = await this.ownedItem(user, id);
    return this.menuItemModel.findByIdAndUpdate(id, { isAvailable: !item.isAvailable }, { returnDocument: 'after' });
  }

  async deleteItem(user: Actor, id: string) {
    const item = await this.ownedItem(user, id);
    await this.menuItemModel.findByIdAndDelete(id);
    await this.uploads.releaseIfUnused([item.image]);
    return { message: 'Item deleted' };
  }

  // ── Public discovery ──────────────────────────────────────────────────────
  async getFullMenu(user: Actor | undefined, restaurantId: string) {
    await this.assertVisible(user, restaurantId);
    const [categories, items] = await Promise.all([
      this.categoryModel.find({ restaurantId }).sort({ sortOrder: 1, createdAt: 1 }),
      this.menuItemModel.find({ restaurantId, isAvailable: true }).sort({ createdAt: 1 }).limit(MAX_MENU_ITEMS),
    ]);
    const byCategory = new Map<string, MenuItemDocument[]>();
    for (const i of items) {
      const k = i.categoryId.toString();
      byCategory.set(k, [...(byCategory.get(k) || []), i]);
    }
    return categories
      .map((cat) => ({ ...cat.toObject(), items: byCategory.get(cat._id.toString()) || [] }))
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

  /** Best sellers over the last 90 days, topped up with recent dishes when there is little order history. */
  async popularDishes(limit = 8) {
    limit = Math.min(24, Math.max(1, limit));
    const since = new Date(Date.now() - 90 * 86400000);
    const ranked = await this.orderModel.aggregate([
      { $match: { status: { $ne: OrderStatus.CANCELLED }, createdAt: { $gte: since } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.menuItemId', sold: { $sum: '$items.quantity' } } },
      { $sort: { sold: -1 } },
      { $limit: limit * 3 },
    ]);
    const soldMap = new Map(ranked.map((r) => [String(r._id), r.sold as number]));
    let items = await this.menuItemModel.find({ _id: { $in: ranked.map((r) => r._id).filter(Boolean) }, isAvailable: true, image: { $ne: null } });
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
    const term = q.trim().slice(0, 100);
    if (term.length < 2) return { dishes: [] };
    const rx = { $regex: escapeRegex(term), $options: 'i' };
    const items = await this.menuItemModel.find({ isAvailable: true, $or: [{ name: rx }, { description: rx }, { tags: rx }] }).limit(20);
    return { dishes: await this.withRestaurants(items) };
  }
}
