import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem, MenuItemDocument, MenuCategory, MenuCategoryDocument } from './menu.schema';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    @InjectModel(MenuCategory.name) private categoryModel: Model<MenuCategoryDocument>,
  ) {}

  async getCategories(restaurantId: string) {
    return this.categoryModel.find({ restaurantId }).sort({ sortOrder: 1 });
  }

  async createCategory(restaurantId: string, data: any) {
    return this.categoryModel.create({ ...data, restaurantId });
  }

  async updateCategory(id: string, data: any) {
    return this.categoryModel.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' });
  }

  async deleteCategory(id: string) {
    await this.categoryModel.findByIdAndDelete(id);
    return { message: 'Category deleted' };
  }

  async getItems(restaurantId: string, categoryId?: string) {
    const filter: any = { restaurantId };
    if (categoryId) filter.categoryId = categoryId;
    return this.menuItemModel.find(filter).sort({ createdAt: -1 });
  }

  async getItemById(id: string) {
    const item = await this.menuItemModel.findById(id);
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async createItem(restaurantId: string, data: any) {
    return this.menuItemModel.create({ ...data, restaurantId });
  }

  async updateItem(id: string, data: any) {
    return this.menuItemModel.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' });
  }

  async toggleAvailability(id: string) {
    const item = await this.menuItemModel.findById(id);
    if (!item) throw new NotFoundException('Item not found');
    return this.menuItemModel.findByIdAndUpdate(
      id,
      { isAvailable: !item.isAvailable },
      { returnDocument: 'after' },
    );
  }

  async deleteItem(id: string) {
    await this.menuItemModel.findByIdAndDelete(id);
    return { message: 'Item deleted' };
  }

  async getFullMenu(restaurantId: string) {
    const [categories, items] = await Promise.all([
      this.categoryModel.find({ restaurantId }).sort({ sortOrder: 1 }),
      this.menuItemModel.find({ restaurantId, isAvailable: true }),
    ]);
    return categories.map(cat => ({
      ...cat.toObject(),
      items: items.filter(i => i.categoryId.toString() === cat._id.toString()),
    }));
  }
}
