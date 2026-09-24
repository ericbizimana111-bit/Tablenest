import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsMongoId, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { EmptyToNull, Trim } from '../../common/validation/validators';
import { TableStatus } from './table.schema';

export class CreateTableDto {
  @Trim()
  @IsString()
  @MinLength(1, { message: 'Table number is required' })
  @MaxLength(20)
  tableNumber: string;

  @Type(() => Number)
  @IsInt({ message: 'Capacity must be a whole number' })
  @Min(1, { message: 'Capacity must be between 1 and 30' })
  @Max(30, { message: 'Capacity must be between 1 and 30' })
  capacity: number;
}

export class UpdateTableDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  tableNumber?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  capacity?: number;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(200)
  serverNotes?: string | null;
}

export class UpdateTableStatusDto {
  @IsEnum(TableStatus)
  status: TableStatus;

  @IsOptional()
  @IsMongoId()
  guestId?: string;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(200)
  serverNotes?: string | null;
}
