import { Type } from 'class-transformer';
import { IsInt, IsMongoId, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { EmptyToNull, Trim } from '../../common/validation/validators';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateReviewDto {
  @IsOptional()
  @IsMongoId()
  orderId?: string;

  @IsOptional()
  @IsMongoId()
  reservationId?: string;

  @Type(() => Number)
  @IsInt({ message: 'Choose a rating from 1 to 5' })
  @Min(1, { message: 'Choose a rating from 1 to 5' })
  @Max(5, { message: 'Choose a rating from 1 to 5' })
  rating: number;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(1500)
  comment?: string | null;
}

export class ReplyReviewDto {
  @Trim()
  @IsString()
  @MinLength(1, { message: 'Reply cannot be empty' })
  @MaxLength(1000)
  reply: string;
}

export class ReviewsQueryDto extends PaginationQueryDto {}
