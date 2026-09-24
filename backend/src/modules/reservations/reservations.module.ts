import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationSchema } from './reservation.schema';
import { Restaurant, RestaurantSchema } from '../restaurants/restaurant.schema';
import { Table, TableSchema } from '../tables/table.schema';
import { User, UserSchema } from '../users/user.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { ReferralsModule } from '../referrals/referrals.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Table.name, schema: TableSchema },
      { name: User.name, schema: UserSchema },
    ]),
    NotificationsModule,
    LoyaltyModule,
    ReferralsModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService, MongooseModule],
})
export class ReservationsModule {}
