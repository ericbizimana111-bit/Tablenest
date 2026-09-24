import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from './order.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { ReferralsModule } from '../referrals/referrals.module';
import { PaymentsModule } from '../payments/payments.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { BillingModule } from '../billing/billing.module';
import { MenuCategory, MenuCategorySchema, MenuItem, MenuItemSchema } from '../menu/menu.schema';
import { Restaurant, RestaurantSchema } from '../restaurants/restaurant.schema';
import { Table, TableSchema } from '../tables/table.schema';
import { User, UserSchema } from '../users/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: MenuCategory.name, schema: MenuCategorySchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Table.name, schema: TableSchema },
      { name: User.name, schema: UserSchema },
    ]),
    NotificationsModule,
    LoyaltyModule,
    ReferralsModule,
    PaymentsModule,
    PromotionsModule,
    BillingModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
