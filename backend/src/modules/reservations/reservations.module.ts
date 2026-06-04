import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationSchema } from './reservation.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Reservation.name, schema: ReservationSchema }])],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService, MongooseModule],
})
export class ReservationsModule {}
