import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, ReplyReviewDto, ReviewsQueryDto } from './reviews.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get('featured')
  featured(@Query('limit') limit?: string) {
    return this.reviewsService.featured(Math.min(24, Number(limit) || 6));
  }

  @Get('restaurant/:restaurantId')
  findByRestaurant(@Param('restaurantId', MongoIdValidationPipe) restaurantId: string, @Query() query: ReviewsQueryDto) {
    return this.reviewsService.findByRestaurant(restaurantId, query);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post()
  create(@Request() req, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user._id.toString(), dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch(':id/reply')
  reply(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: ReplyReviewDto) {
    return this.reviewsService.replyToReview(req.user, id, dto.reply);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @Delete(':id')
  delete(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.reviewsService.delete(req.user, id);
  }
}
