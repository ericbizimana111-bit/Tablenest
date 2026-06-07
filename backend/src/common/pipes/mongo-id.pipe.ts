import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class MongoIdValidationPipe implements PipeTransform<string, string> {
    transform(value: string) {
        if (!value || !isValidObjectId(value)) {
            throw new BadRequestException(`Invalid MongoDB ObjectId: ${value}`);
        }
        return value;
    }
}
