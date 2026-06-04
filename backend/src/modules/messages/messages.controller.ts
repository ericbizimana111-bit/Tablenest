import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
    constructor(private messagesService: MessagesService) { }

    @Get('conversations')
    getConversations(@Request() req) {
        return this.messagesService.getConversations(req.user._id.toString());
    }

    @Get('conversations/:id')
    getMessages(@Param('id') id: string) {
        return this.messagesService.getMessages(id);
    }

    @Post('conversations')
    createConversation(@Body() body: { participants: string[]; restaurantId?: string }) {
        return this.messagesService.createConversation(body.participants, body.restaurantId);
    }

    @Post('send')
    sendMessage(@Request() req, @Body() body: { conversationId: string; content: string }) {
        return this.messagesService.sendMessage(req.user._id.toString(), body.conversationId, body.content);
    }
}