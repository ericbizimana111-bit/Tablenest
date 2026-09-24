import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { MenuItem, MenuItemSchema, MenuCategory, MenuCategorySchema } from './menu.schema';
import { Order, OrderSchema } from '../orders/order.schema';
import { Restaurant, RestaurantSchema } from '../restaurants/restaurant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: MenuCategory.name, schema: MenuCategorySchema },
      { name: Order.name, schema: OrderSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
  ],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService, MongooseModule],
})
export class MenuModule {}
