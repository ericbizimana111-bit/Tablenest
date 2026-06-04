import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Get('public')
  findPublic(@Query() query: any) {
    return this.restaurantsService.findPublic(query);
  }

  @Get('public/:id')
  findPublicById(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Query() query: any) {
    return this.restaurantsService.findAll(query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('pending')
  getPending() {
    return this.restaurantsService.getPendingApprovals();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  getStats() {
    return this.restaurantsService.getStats();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-restaurant')
  getMyRestaurant(@Request() req) {
    return this.restaurantsService.findByOwner(req.user._id.toString());
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req, @Body() data: any) {
    return this.restaurantsService.create(req.user._id.toString(), data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() data: any) {
    return this.restaurantsService.update(id, req.user._id.toString(), data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.restaurantsService.approve(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.restaurantsService.reject(id, body.reason);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/suspend')
  suspend(@Param('id') id: string) {
    return this.restaurantsService.suspend(id);
  }
}
