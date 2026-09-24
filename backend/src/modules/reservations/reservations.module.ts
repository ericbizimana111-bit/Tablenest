import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { SlotLockService } from './slot-lock.service';
import { Reservation, ReservationSchema, ReservationSlot, ReservationSlotSchema } from './reservation.schema';
import { Restaurant, RestaurantSchema } from '../restaurants/restaurant.schema';
import { Table, TableSchema } from '../tables/table.schema';
import { User, UserSchema } from '../users/user.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { ReferralsModule } from '../referrals/referrals.module';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: ReservationSlot.name, schema: ReservationSlotSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Table.name, schema: TableSchema },
      { name: User.name, schema: UserSchema },
    ]),
    NotificationsModule,
    LoyaltyModule,
    ReferralsModule,
    BillingModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, SlotLockService],
  exports: [ReservationsService, SlotLockService],
})
export class ReservationsModule {}
