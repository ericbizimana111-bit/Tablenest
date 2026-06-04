import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { OrderStatus } from './order.schema';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.ordersService.findAll(query);
  }

  @Get('stats')
  getStats(@Query('restaurantId') restaurantId?: string) {
    return this.ordersService.getStats(restaurantId);
  }

  @Get('revenue')
  getRevenue(@Query('restaurantId') restaurantId: string, @Query('days') days?: number) {
    return this.ordersService.getRevenueByDay(restaurantId, days);
  }

  @Get('my-orders')
  getMyOrders(@Request() req, @Query() query: any) {
    return this.ordersService.findByCustomer(req.user._id.toString(), query);
  }

  @Get('restaurant/:restaurantId')
  getByRestaurant(@Param('restaurantId') restaurantId: string, @Query() query: any) {
    return this.ordersService.findByRestaurant(restaurantId, query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.ordersService.create(req.user._id.toString(), data);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: OrderStatus; note?: string }) {
    return this.ordersService.updateStatus(id, body.status, body.note);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }
}
