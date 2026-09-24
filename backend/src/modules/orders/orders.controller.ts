import { Body, Controller, Get, Headers, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { OrdersService } from './orders.service';
import { CreateOrderDto, OrdersQueryDto, QuoteOrderDto, RevenueQueryDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { AccessControlService } from '../../common/services/access-control.service';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private accessControl: AccessControlService,
  ) {}

  /** The signed-in owner's restaurant orders (kitchen display). */
  @Get()
  @Roles(UserRole.OWNER)
  async findAll(@Request() req, @Query() query: OrdersQueryDto) {
    const restaurantId = await this.accessControl.getOwnerRestaurantId(req.user);
    return this.ordersService.findForRestaurant(restaurantId, query);
  }

  @Get('stats')
  @Roles(UserRole.OWNER)
  async getStats(@Request() req) {
    const restaurantId = await this.accessControl.getOwnerRestaurantId(req.user);
    return this.ordersService.getStats(restaurantId);
  }

  @Get('revenue')
  @Roles(UserRole.OWNER)
  async getRevenue(@Request() req, @Query() q: RevenueQueryDto) {
    const restaurantId = await this.accessControl.getOwnerRestaurantId(req.user);
    return this.ordersService.getRevenueByDay(restaurantId, q.days || 7);
  }

  @Get('my-orders')
  @Roles(UserRole.CUSTOMER)
  getMyOrders(@Request() req, @Query() query: OrdersQueryDto) {
    return this.ordersService.findByCustomer(req.user._id.toString(), query);
  }

  @Get('restaurant/:restaurantId')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async getByRestaurant(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string, @Query() query: OrdersQueryDto) {
    await this.accessControl.assertRestaurantOwner(req.user, restaurantId);
    return this.ordersService.findForRestaurant(restaurantId, query);
  }

  @Post('quote')
  @Roles(UserRole.CUSTOMER)
  quote(@Request() req, @Body() dto: QuoteOrderDto) {
    return this.ordersService.quote(req.user._id.toString(), dto);
  }

  @Get(':id')
  findById(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.ordersService.findVisible(req.user, id);
  }

  /** Send an `Idempotency-Key` header (8–64 chars) so a retried submit returns the same order. */
  @Post()
  @Roles(UserRole.CUSTOMER)
  create(@Request() req, @Body() dto: CreateOrderDto, @Headers('idempotency-key') key?: string) {
    const idempotencyKey = key && /^[\w-]{8,64}$/.test(key) ? key : undefined;
    return this.ordersService.create(req.user, dto, idempotencyKey);
  }

  @Patch(':id/status')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  updateStatus(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(req.user, id, dto.status, dto.note);
  }

  @Patch(':id/cancel')
  cancel(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.ordersService.cancel(req.user, id);
  }
}
