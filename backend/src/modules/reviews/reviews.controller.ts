import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get('featured')
  featured(@Query('limit') limit?: string) {
    return this.reviewsService.featured(Number(limit) || 6);
  }

  @Get('restaurant/:restaurantId')
  findByRestaurant(@Param('restaurantId', MongoIdValidationPipe) restaurantId: string, @Query() query: any) {
    return this.reviewsService.findByRestaurant(restaurantId, query);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post()
  create(@Request() req, @Body() data: any) {
    return this.reviewsService.create(req.user._id.toString(), data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch(':id/reply')
  reply(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() body: { reply: string }) {
    return this.reviewsService.replyToReview(req.user, id, body.reply);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Delete(':id')
  delete(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.reviewsService.delete(req.user._id.toString(), id);
  }
}
