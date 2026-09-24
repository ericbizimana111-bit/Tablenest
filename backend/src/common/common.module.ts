import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Restaurant, RestaurantSchema } from '../modules/restaurants/restaurant.schema';
import { AccessControlService } from './services/access-control.service';
import { MailService } from './services/mail.service';
import { RolesGuard } from './guards/roles.guard';
import { AuditLog, AuditLogSchema } from './audit/audit-log.schema';
import { AuditService } from './audit/audit.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [AccessControlService, RolesGuard, MailService, AuditService],
  exports: [AccessControlService, RolesGuard, MailService, AuditService],
})
export class CommonModule {}
