import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { PaginationQueryDto, pageParams } from '../../common/dto/pagination.dto';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  /** The signed-in user's own payment history. */
  @Get()
  findByUser(@Request() req, @Query() q: PaginationQueryDto) {
    const { page, limit } = pageParams(q, 20);
    return this.paymentsService.findByUser(req.user._id.toString(), page, limit);
  }
}
