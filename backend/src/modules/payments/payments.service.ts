import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from './payments.schema';

@Injectable()
export class PaymentsService {
    constructor(@InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>) { }

    async create(userId: string, data: any) {
        return this.paymentModel.create({ ...data, userId, status: PaymentStatus.SUCCESS });
    }

    async findByUser(userId: string) {
        return this.paymentModel.find({ userId }).sort({ createdAt: -1 });
    }

    async findByOrder(orderId: string) {
        return this.paymentModel.findOne({ orderId });
    }
}