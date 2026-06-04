import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
    constructor(private reviewsService: ReviewsService) { }

    @Get('restaurant/:restaurantId')
    findByRestaurant(@Param('restaurantId') restaurantId: string, @Query() query: any) {
        return this.reviewsService.findByRestaurant(restaurantId, query);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Request() req, @Body() data: any) {
        return this.reviewsService.create(req.user._id.toString(), data);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/reply')
    reply(@Param('id') id: string, @Body() body: { reply: string }) {
        return this.reviewsService.replyToReview(id, body.reply);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.reviewsService.delete(id);
    }
}