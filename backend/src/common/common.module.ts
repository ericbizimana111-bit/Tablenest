import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Restaurant, RestaurantSchema } from '../modules/restaurants/restaurant.schema';
import { AccessControlService } from './services/access-control.service';
import { MailService } from './services/mail.service';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Restaurant.name, schema: RestaurantSchema }]),
  ],
  providers: [AccessControlService, RolesGuard, MailService],
  exports: [AccessControlService, RolesGuard, MailService],
})
export class CommonModule {}
