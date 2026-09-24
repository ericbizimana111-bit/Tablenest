import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { MenuItem, MenuItemSchema, MenuCategory, MenuCategorySchema } from './menu.schema';
import { Order, OrderSchema } from '../orders/order.schema';
import { Restaurant, RestaurantSchema } from '../restaurants/restaurant.schema';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: MenuCategory.name, schema: MenuCategorySchema },
      { name: Order.name, schema: OrderSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
    UploadsModule,
  ],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
