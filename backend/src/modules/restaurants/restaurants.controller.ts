import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Get('public')
  findPublic(@Query() query: any) {
    return this.restaurantsService.findPublic(query);
  }

  @Get('public/:id')
  findPublicById(@Param('id', MongoIdValidationPipe) id: string) {
    return this.restaurantsService.findPublicById(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  findAll(@Query() query: any) {
    return this.restaurantsService.findAll(query);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('pending')
  getPending() {
    return this.restaurantsService.getPendingApprovals();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('stats')
  getStats() {
    return this.restaurantsService.getStats();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Get('my-restaurant')
  getMyRestaurant(@Request() req) {
    return this.restaurantsService.findByOwner(req.user._id.toString());
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':id')
  findById(@Param('id', MongoIdValidationPipe) id: string) {
    return this.restaurantsService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  @Post()
  create(@Request() req, @Body() data: any) {
    return this.restaurantsService.create(req.user._id.toString(), data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  @Put(':id')
  update(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() data: any) {
    return this.restaurantsService.update(id, req.user._id.toString(), data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/approve')
  approve(@Param('id', MongoIdValidationPipe) id: string) {
    return this.restaurantsService.approve(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/reject')
  reject(@Param('id', MongoIdValidationPipe) id: string, @Body() body: { reason: string }) {
    return this.restaurantsService.reject(id, body.reason);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/suspend')
  suspend(@Param('id', MongoIdValidationPipe) id: string) {
    return this.restaurantsService.suspend(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id', MongoIdValidationPipe) id: string) {
    return this.restaurantsService.remove(id);
  }
}
