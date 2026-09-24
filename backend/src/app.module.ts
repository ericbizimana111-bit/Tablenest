import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validateEnv } from './config/env.validation';
import { CommonModule } from './common/common.module';
import { HealthController } from './health.controller';
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
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { StaffModule } from './modules/staff/staff.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SupportModule } from './modules/support/support.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { SettingsModule } from './modules/settings/settings.module';
import { BillingModule } from './modules/billing/billing.module';
import { AdminModule } from './modules/admin/admin.module';

const nodeEnv = process.env.NODE_ENV || 'development';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      // Real environment variables always win over files. Tests never read .env files.
      ignoreEnvFile: nodeEnv === 'test',
      envFilePath: [`.env.${nodeEnv}.local`, `.env.${nodeEnv}`, '.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
        maxPoolSize: Number(config.get('MONGO_MAX_POOL_SIZE') || 20),
        serverSelectionTimeoutMS: 10_000,
        autoIndex: config.get('MONGO_AUTO_INDEX') !== 'false',
      }),
    }),
    CommonModule,
    SettingsModule,
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
    LoyaltyModule,
    ReferralsModule,
    InventoryModule,
    StaffModule,
    AnalyticsModule,
    SupportModule,
    UploadsModule,
    BillingModule,
    AdminModule,
  ],
})
export class AppModule {}
