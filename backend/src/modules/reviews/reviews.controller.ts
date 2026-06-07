import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
    constructor(private reviewsService: ReviewsService) { }

    @Get('restaurant/:restaurantId')
    findByRestaurant(@Param('restaurantId', MongoIdValidationPipe) restaurantId: string, @Query() query: any) {
        return this.reviewsService.findByRestaurant(restaurantId, query);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Request() req, @Body() data: any) {
        return this.reviewsService.create(req.user._id.toString(), data);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/reply')
    reply(@Param('id', MongoIdValidationPipe) id: string, @Body() body: { reply: string }) {
        return this.reviewsService.replyToReview(id, body.reply);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    delete(@Param('id', MongoIdValidationPipe) id: string) {
        return this.reviewsService.delete(id);
    }
}