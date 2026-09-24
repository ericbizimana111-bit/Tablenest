import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto, PublicRestaurantQueryDto, UpdateRestaurantDto } from './dto/restaurant.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Get('public')
  findPublic(@Query() query: PublicRestaurantQueryDto) {
    return this.restaurantsService.findPublic(query);
  }

  @Get('public/featured')
  featured(@Query('limit') limit?: string) {
    return this.restaurantsService.featured(Number(limit) || 8);
  }

  @Get('public/cuisines')
  cuisines() {
    return this.restaurantsService.cuisines();
  }

  @Get('public/stats')
  stats() {
    return this.restaurantsService.platformStats();
  }

  @Get('public/:id')
  findPublicById(@Param('id', MongoIdValidationPipe) id: string) {
    return this.restaurantsService.findPublicById(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Get('my-restaurant')
  getMyRestaurant(@Request() req) {
    return this.restaurantsService.findByOwner(req.user._id.toString());
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Get(':id')
  findById(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.restaurantsService.findManaged(req.user, id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Post()
  create(@Request() req, @Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.create(req.user, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Put(':id')
  update(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: UpdateRestaurantDto) {
    return this.restaurantsService.update(req.user, id, dto);
  }
}
