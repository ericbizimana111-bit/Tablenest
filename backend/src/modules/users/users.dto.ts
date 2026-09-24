import { ApiHideProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmpty, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { EmptyToNull, IMAGE_URL_RE, Trim } from '../../common/validation/validators';

export class UpdateProfileDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName?: string;

  @IsOptional()
  @EmptyToNull()
  @Matches(/^\+?[\d\s()-]{6,20}$/, { message: 'Enter a valid phone number' })
  phone?: string | null;

  @IsOptional()
  @EmptyToNull()
  @Matches(IMAGE_URL_RE, { message: 'avatar must be an uploaded image URL' })
  avatar?: string | null;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(300)
  address?: string | null;
}

export class NotificationPrefsDto {
  @IsOptional()
  @IsBoolean()
  bookingConfirmation?: boolean;

  @IsOptional()
  @IsBoolean()
  marketing?: boolean;

  @IsOptional()
  @IsBoolean()
  orderTracking?: boolean;
}

export class AddressDto {
  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(40)
  label?: string | null;

  @Trim()
  @IsString()
  @MinLength(1, { message: 'Street address is required' })
  @MaxLength(200)
  street: string;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(80)
  city?: string | null;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(80)
  state?: string | null;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(20)
  zip?: string | null;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(40)
  label?: string | null;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  street?: string;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(80)
  city?: string | null;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(80)
  state?: string | null;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(20)
  zip?: string | null;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

/**
 * Saved-card *display* data only. Full card numbers and CVVs must never be sent to this API —
 * they belong with a PCI-compliant payment provider. A `cardNumber` field is rejected outright.
 */
export class PaymentMethodDto {
  @IsEmpty({ message: 'Never send full card numbers to TableNest — only last4, brand and expiry' })
  @ApiHideProperty()
  cardNumber?: string;

  @IsEmpty({ message: 'Never send card security codes to TableNest' })
  @ApiHideProperty()
  cvv?: string;

  @Matches(/^\d{4}$/, { message: 'last4 must be the last 4 digits of the card' })
  last4: string;

  @IsOptional()
  @IsIn(['Visa', 'Mastercard', 'Amex', 'Discover', 'Card'])
  brand?: string;

  @Matches(/^(0?[1-9]|1[0-2])$/, { message: 'A valid expiry month is required' })
  expiryMonth: string;

  @Matches(/^(\d{2}|\d{4})$/, { message: 'A valid expiry year is required' })
  expiryYear: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
