import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationsService } from './reservations.service';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { ReservationStatus } from './reservation.schema';
import { AccessControlService } from '../../common/services/access-control.service';
import {
  AvailabilityQueryDto,
  CalendarQueryDto,
  CancelReservationDto,
  CreateReservationDto,
  RestaurantReservationsQueryDto,
  SetReservationStatusDto,
  UpdateReservationDto,
} from './reservations.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(
    private reservationsService: ReservationsService,
    private access: AccessControlService,
  ) {}

  /** Public — lets guests see open time slots before they sign up. */
  @Get('availability')
  availability(@Query() q: AvailabilityQueryDto) {
    return this.reservationsService.getAvailability(q);
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
  async getCalendar(@Request() req, @Query() q: CalendarQueryDto) {
    const restaurantId = await this.access.getOwnerRestaurantId(req.user);
    return this.reservationsService.getCalendarData(req.user, restaurantId, q.month, q.year);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Get('my-reservations')
  getMyReservations(@Request() req) {
    return this.reservationsService.findByCustomer(req.user._id.toString());
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Get('restaurant/:restaurantId')
  getByRestaurant(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string, @Query() query: RestaurantReservationsQueryDto) {
    return this.reservationsService.findByRestaurant(req.user, restaurantId, query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findById(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.reservationsService.findById(id, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post()
  create(@Request() req, @Body() dto: CreateReservationDto) {
    return this.reservationsService.create(req.user, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Patch(':id/confirm')
  confirm(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.reservationsService.setStatus(req.user, id, ReservationStatus.CONFIRMED);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/cancel')
  cancel(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: CancelReservationDto) {
    return this.reservationsService.setStatus(req.user, id, ReservationStatus.CANCELLED, dto.reason);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Patch(':id/arrived')
  markArrived(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.reservationsService.setStatus(req.user, id, ReservationStatus.ARRIVED);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Patch(':id/status')
  setStatus(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: SetReservationStatusDto) {
    return this.reservationsService.setStatus(req.user, id, dto.status, dto.reason);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Patch(':id')
  update(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: UpdateReservationDto) {
    return this.reservationsService.update(req.user, id, dto);
  }
}
