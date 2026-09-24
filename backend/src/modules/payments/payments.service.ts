import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { Payment, PaymentDocument, PaymentStatus } from './payment.schema';

export interface ChargeInput {
  userId: string;
  orderId: string;
  amount: number;
  method: 'cash' | 'card';
  last4?: string | null;
}

/**
 * Payment ledger. Card charges are recorded through `charge()` — this is the single
 * integration point for a real gateway (Stripe/Paystack/etc.): swap the body of
 * `authorize()` for the provider call and keep the rest as is.
 */
@Injectable()
export class PaymentsService {
  constructor(@InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>) {}

  private async authorize(_input: ChargeInput): Promise<{ ok: boolean; transactionId: string }> {
    return { ok: true, transactionId: 'txn_' + crypto.randomBytes(8).toString('hex') };
  }

  async charge(input: ChargeInput) {
    if (input.method === 'cash') {
      return this.paymentModel.create(<any>{
        userId: input.userId,
        orderId: input.orderId,
        amount: input.amount,
        method: 'cash',
        status: PaymentStatus.PENDING,
      });
    }
    const result = await this.authorize(input);
    return this.paymentModel.create(<any>{
      userId: input.userId,
      orderId: input.orderId,
      amount: input.amount,
      method: 'card',
      last4: input.last4 || null,
      transactionId: result.transactionId,
      status: result.ok ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
    });
  }

  async markPaid(orderId: string) {
    await this.paymentModel.updateOne({ orderId, status: PaymentStatus.PENDING }, { status: PaymentStatus.SUCCESS });
  }

  async refund(orderId: string) {
    await this.paymentModel.updateOne({ orderId, status: PaymentStatus.SUCCESS }, { status: PaymentStatus.REFUNDED });
  }

  findByUser(userId: string) {
    return this.paymentModel.find({ userId }).sort({ createdAt: -1 });
  }
}
