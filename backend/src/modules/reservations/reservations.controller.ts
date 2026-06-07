import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationsService } from './reservations.service';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';

@Controller('reservations')
@UseGuards(AuthGuard('jwt'))
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) { }

  @Get()
  findAll(@Query() query: any) {
    return this.reservationsService.findAll(query);
  }

  @Get('stats')
  getStats(@Query('restaurantId') restaurantId?: string) {
    return this.reservationsService.getStats(restaurantId);
  }

  @Get('calendar')
  getCalendar(
    @Query('restaurantId') restaurantId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.reservationsService.getCalendarData(restaurantId, +month, +year);
  }

  @Get('my-reservations')
  getMyReservations(@Request() req) {
    return this.reservationsService.findByCustomer(req.user._id.toString());
  }

  @Get('restaurant/:restaurantId')
  getByRestaurant(@Param('restaurantId', MongoIdValidationPipe) restaurantId: string, @Query() query: any) {
    return this.reservationsService.findByRestaurant(restaurantId, query);
  }

  @Get(':id')
  findById(@Param('id', MongoIdValidationPipe) id: string) {
    return this.reservationsService.findById(id);
  }

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.reservationsService.create(req.user._id.toString(), data);
  }

  @Patch(':id/confirm')
  confirm(@Param('id', MongoIdValidationPipe) id: string) {
    return this.reservationsService.confirm(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', MongoIdValidationPipe) id: string) {
    return this.reservationsService.cancel(id);
  }

  @Patch(':id/arrived')
  markArrived(@Param('id', MongoIdValidationPipe) id: string) {
    return this.reservationsService.markArrived(id);
  }
}
