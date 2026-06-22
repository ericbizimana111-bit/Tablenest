import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { OrdersService } from './orders.service';
import { OrderStatus } from './order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER)
  async findAll(@Request() req, @Query() query: any) {
    if (req.user.role === UserRole.OWNER) {
      const restaurantId = await this.accessControl.getOwnerRestaurantId(req.user);
      return this.ordersService.findAll({ ...query, restaurantId });
    }
    return this.ordersService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER)
  async getStats(@Request() req, @Query('restaurantId') restaurantId?: string) {
    if (req.user.role === UserRole.OWNER) {
      restaurantId = await this.accessControl.getOwnerRestaurantId(req.user);
    }
    return this.ordersService.getStats(restaurantId);
  }

  @Get('revenue')
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  async getRevenue(@Request() req, @Query('restaurantId') restaurantId: string, @Query('days') days?: number) {
    if (req.user.role === UserRole.OWNER) {
      restaurantId = await this.accessControl.getOwnerRestaurantId(req.user);
    }
    await this.accessControl.assertRestaurantOwner(req.user, restaurantId);
    return this.ordersService.getRevenueByDay(restaurantId, days);
  }

  @Get('my-orders')
  @Roles(UserRole.CUSTOMER)
  getMyOrders(@Request() req, @Query() query: any) {
    return this.ordersService.findByCustomer(req.user._id.toString(), query);
  }

  @Get('restaurant/:restaurantId')
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  async getByRestaurant(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string, @Query() query: any) {
    await this.accessControl.assertRestaurantOwner(req.user, restaurantId);
    return this.ordersService.findByRestaurant(restaurantId, query);
  }

  @Get(':id')
  async findById(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    const order = await this.ordersService.findById(id);
    const userId = req.user._id.toString();
    const isCustomer = order.customerId.toString() === userId;
    const isAdmin = req.user.role === UserRole.SUPER_ADMIN;
    let isOwner = false;
    if (req.user.role === UserRole.OWNER) {
      try {
        await this.accessControl.assertRestaurantOwner(req.user, order.restaurantId.toString());
        isOwner = true;
      } catch {
        isOwner = false;
      }
    }
    if (!isCustomer && !isAdmin && !isOwner) {
      throw new ForbiddenException('Access denied');
    }
    return order;
  }

  @Post()
  @Roles(UserRole.CUSTOMER)
  create(@Request() req, @Body() data: CreateOrderDto) {
    return this.ordersService.create(req.user._id.toString(), data);
  }

  @Patch(':id/status')
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  updateStatus(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() body: { status: OrderStatus; note?: string }) {
    return this.ordersService.updateStatus(id, body.status, body.note, req.user);
  }

  @Patch(':id/cancel')
  cancel(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.ordersService.cancel(id, req.user);
  }
}
