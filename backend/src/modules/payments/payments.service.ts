import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from './payment.schema';

/**
 * Payment records for orders. Today every order is paid in person (cash or card at the
 * restaurant / on delivery), so a record opens as `pending` and becomes `success` when the order
 * is completed. There is deliberately no simulated card charge: online payments stay disabled until
 * a real gateway (e.g. Stripe, Flutterwave, MTN MoMo) is integrated behind `cardPaymentsEnabled`.
 */
@Injectable()
export class PaymentsService {
  constructor(@InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>) {}

  cardPaymentsEnabled() {
    return false;
  }

  open(input: { userId: string; orderId: string; amount: number; currency: string; method: 'cash' | 'card' }) {
    return this.paymentModel.create({
      userId: new Types.ObjectId(input.userId),
      orderId: new Types.ObjectId(input.orderId),
      amount: input.amount,
      currency: input.currency,
      method: input.method,
      status: PaymentStatus.PENDING,
    });
  }

  /** Collected in person when the order was completed. */
  async settle(orderId: string) {
    await this.paymentModel.updateOne({ orderId, status: PaymentStatus.PENDING }, { status: PaymentStatus.SUCCESS });
  }

  async cancel(orderId: string) {
    await this.paymentModel.updateOne({ orderId, status: PaymentStatus.PENDING }, { status: PaymentStatus.CANCELLED });
    await this.paymentModel.updateOne({ orderId, status: PaymentStatus.SUCCESS }, { status: PaymentStatus.REFUNDED });
  }

  async findByUser(userId: string, page: number, limit: number) {
    const filter = { userId: new Types.ObjectId(userId) };
    const [payments, total] = await Promise.all([
      this.paymentModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.paymentModel.countDocuments(filter),
    ]);
    return { payments, total, page, pages: Math.ceil(total / limit) };
  }
}
