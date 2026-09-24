import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationsService } from './reservations.service';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { ReservationStatus } from './reservation.schema';
import { AccessControlService } from '../../common/services/access-control.service';

@Controller('reservations')
export class ReservationsController {
  constructor(
    private reservationsService: ReservationsService,
    private access: AccessControlService,
  ) {}

  /** Public — lets guests see open time slots before they sign up. */
  @Get('availability')
  availability(
    @Query('restaurantId', MongoIdValidationPipe) restaurantId: string,
    @Query('date') date: string,
    @Query('guests') guests?: string,
  ) {
    return this.reservationsService.getAvailability(restaurantId, date, Number(guests) || 2);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Get('stats')
  async getStats(@Request() req) {
    const restaurantId = await this.access.getOwnerRestaurantId(req.user);
    return this.reservationsService.getStats(req.user, restaurantId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Get('calendar')
  async getCalendar(@Request() req, @Query('month') month: string, @Query('year') year: string) {
    const restaurantId = await this.access.getOwnerRestaurantId(req.user);
    return this.reservationsService.getCalendarData(req.user, restaurantId, Number(month), Number(year));
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Get('my-reservations')
  getMyReservations(@Request() req) {
    return this.reservationsService.findByCustomer(req.user._id.toString());
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Get('restaurant/:restaurantId')
  getByRestaurant(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string, @Query() query: any) {
    return this.reservationsService.findByRestaurant(req.user, restaurantId, query);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':id')
  findById(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.reservationsService.findById(id, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post()
  create(@Request() req, @Body() data: any) {
    return this.reservationsService.create(req.user._id.toString(), data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch(':id/confirm')
  confirm(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.reservationsService.confirm(id, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id/cancel')
  cancel(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() body: { reason?: string }) {
    return this.reservationsService.cancel(id, req.user, body?.reason);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch(':id/arrived')
  markArrived(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.reservationsService.markArrived(id, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch(':id/status')
  setStatus(
    @Request() req,
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() body: { status: ReservationStatus; reason?: string },
  ) {
    return this.reservationsService.setStatus(req.user, id, body.status, body.reason);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Patch(':id')
  update(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() data: any) {
    return this.reservationsService.update(id, req.user, data);
  }
}
