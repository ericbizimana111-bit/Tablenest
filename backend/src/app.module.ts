import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { MenuModule } from './modules/menu/menu.module';
import { TablesModule } from './modules/tables/tables.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MessagesModule } from './modules/messages/messages.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { StaffModule } from './modules/staff/staff.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SupportModule } from './modules/support/support.module';
import { UploadsModule } from './modules/uploads/uploads.module';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/tablenest'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    RestaurantsModule,
    MenuModule,
    TablesModule,
    ReservationsModule,
    OrdersModule,
    PaymentsModule,
    PromotionsModule,
    ReviewsModule,
    NotificationsModule,
    MessagesModule,
    LoyaltyModule,
    ReferralsModule,
    InventoryModule,
    StaffModule,
    AnalyticsModule,
    SupportModule,
    UploadsModule,
   
   
  ],
})
export class AppModule {}
