import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { Table, TableSchema } from './table.schema';
import { Reservation, ReservationSchema } from '../reservations/reservation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Table.name, schema: TableSchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
  ],
  controllers: [TablesController],
  providers: [TablesService],
})
export class TablesModule {}
