import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { OrdersService } from './orders.service';
import { OrderStatus } from './order.schema';
import { CreateOrderDto, QuoteOrderDto } from './dto/create-order.dto';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { AccessControlService } from '../../common/services/access-control.service';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private accessControl: AccessControlService,
  ) {}

  @Get()
  @Roles(UserRole.OWNER)
  async findAll(@Request() req, @Query() query: any) {
    const restaurantId = await this.accessControl.getOwnerRestaurantId(req.user);
    return this.ordersService.findAll({ ...query, restaurantId });
  }

  @Get('stats')
  @Roles(UserRole.OWNER)
  async getStats(@Request() req) {
    const restaurantId = await this.accessControl.getOwnerRestaurantId(req.user);
    return this.ordersService.getStats(restaurantId);
  }

  @Get('revenue')
  @Roles(UserRole.OWNER)
  async getRevenue(@Request() req, @Query('days') days?: string) {
    const restaurantId = await this.accessControl.getOwnerRestaurantId(req.user);
    return this.ordersService.getRevenueByDay(restaurantId, Number(days) || 7);
  }

  @Get('my-orders')
  @Roles(UserRole.CUSTOMER)
  getMyOrders(@Request() req, @Query() query: any) {
    return this.ordersService.findByCustomer(req.user._id.toString(), query);
  }

  @Get('restaurant/:restaurantId')
  @Roles(UserRole.OWNER)
  async getByRestaurant(
    @Request() req,
    @Param('restaurantId', MongoIdValidationPipe) restaurantId: string,
    @Query() query: any,
  ) {
    await this.accessControl.assertRestaurantOwner(req.user, restaurantId);
    return this.ordersService.findByRestaurant(restaurantId, query);
  }

  @Post('quote')
  @Roles(UserRole.CUSTOMER)
  quote(@Request() req, @Body() data: QuoteOrderDto) {
    return this.ordersService.quote(req.user._id.toString(), data);
  }

  @Get(':id')
  async findById(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    const order = await this.ordersService.findById(id);
    const isCustomer = order.customerId.toString() === req.user._id.toString();
    let isOwner = false;
    if (req.user.role === UserRole.OWNER) {
      try {
        await this.accessControl.assertRestaurantOwner(req.user, order.restaurantId.toString());
        isOwner = true;
      } catch {
        isOwner = false;
      }
    }
    if (!isCustomer && !isOwner) throw new ForbiddenException('Access denied');
    return order;
  }

  @Post()
  @Roles(UserRole.CUSTOMER)
  create(@Request() req, @Body() data: CreateOrderDto) {
    return this.ordersService.create(req.user._id.toString(), data);
  }

  @Patch(':id/status')
  @Roles(UserRole.OWNER)
  updateStatus(
    @Request() req,
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() body: { status: OrderStatus; note?: string },
  ) {
    return this.ordersService.updateStatus(id, body.status, body.note, req.user);
  }

  @Patch(':id/cancel')
  cancel(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.ordersService.cancel(id, req.user);
  }
}
