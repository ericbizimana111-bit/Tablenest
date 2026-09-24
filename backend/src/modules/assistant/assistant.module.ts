import { Body, Controller, Get, HttpCode, Module, Post, Request, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateNested } from 'class-validator';
import Anthropic from '@anthropic-ai/sdk';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { Restaurant, RestaurantSchema } from '../restaurants/restaurant.schema';
import { MenuCategory, MenuCategorySchema, MenuItem, MenuItemSchema } from '../menu/menu.schema';
import { Order, OrderSchema } from '../orders/order.schema';
import { Reservation, ReservationSchema } from '../reservations/reservation.schema';
import { ReservationsModule } from '../reservations/reservations.module';
import { ANTHROPIC_CLIENT, AssistantService } from './assistant.service';

class TurnDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content: string;
}

class ContextDto {
  @IsOptional()
  @Matches(/^\/[\w\-/?=&.%]*$/)
  @MaxLength(200)
  path?: string;
}

class ChatDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(24)
  @ValidateNested({ each: true })
  @Type(() => TurnDto)
  messages: TurnDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ContextDto)
  context?: ContextDto;
}

@Controller('assistant')
class AssistantController {
  constructor(private assistant: AssistantService) {}

  @Get('status')
  status() {
    return { enabled: this.assistant.enabled };
  }

  /** Stateless: the client sends the recent conversation each time. Signed-in visitors get personal answers. */
  @UseGuards(OptionalJwtGuard)
  @Post('chat')
  @HttpCode(200)
  chat(@Request() req, @Body() dto: ChatDto) {
    const turns = dto.messages.slice(-12);
    // The conversation must start with and end on the visitor.
    while (turns.length && turns[0].role !== 'user') turns.shift();
    if (!turns.length || turns[turns.length - 1].role !== 'user') {
      return { reply: 'What would you like to know?', suggestions: [] };
    }
    return this.assistant.chat(turns, req.user, dto.context?.path);
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: MenuCategory.name, schema: MenuCategorySchema },
      { name: Order.name, schema: OrderSchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
    ReservationsModule,
  ],
  controllers: [AssistantController],
  providers: [
    AssistantService,
    {
      provide: ANTHROPIC_CLIENT,
      inject: [ConfigService],
      // Enabled only when credentials are configured; otherwise the endpoint answers 503 and the UI says so.
      useFactory: (config: ConfigService) =>
        config.get('ANTHROPIC_API_KEY') || config.get('ANTHROPIC_AUTH_TOKEN') ? new Anthropic({ timeout: 60_000, maxRetries: 2 }) : null,
    },
  ],
})
export class AssistantModule {}
