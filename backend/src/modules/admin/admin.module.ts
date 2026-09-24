import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../users/user.schema';
import { Restaurant, RestaurantSchema } from '../restaurants/restaurant.schema';
import { Order, OrderSchema } from '../orders/order.schema';
import { Reservation, ReservationSchema } from '../reservations/reservation.schema';
import { Upload, UploadSchema } from '../uploads/upload.schema';
import { AuditLog, AuditLogSchema } from '../../common/audit/audit-log.schema';
import { BillingModule } from '../billing/billing.module';
import { OrdersModule } from '../orders/orders.module';
import { SupportModule } from '../support/support.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Upload.name, schema: UploadSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    BillingModule,
    OrdersModule,
    SupportModule,
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
