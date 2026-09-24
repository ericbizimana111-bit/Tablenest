import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class RegisterDto {
  @Transform(trim)
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(80)
  fullName: string;

  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Enter a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100)
  @Matches(/[A-Za-z]/, { message: 'Password must contain a letter' })
  @Matches(/\d/, { message: 'Password must contain a number' })
  password: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Matches(/^\+?[\d\s()-]{6,20}$/, { message: 'Enter a valid phone number' })
  phone?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(40)
  referralCode?: string;
}

export class LoginDto {
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Enter a valid email address' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(100)
  password: string;
}

export class ForgotPasswordDto {
  @Transform(normalizeEmail)
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @Matches(/^[a-f0-9]{64}$/, { message: 'This reset link is invalid or has expired' })
  token: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100)
  @Matches(/[A-Za-z]/, { message: 'Password must contain a letter' })
  @Matches(/\d/, { message: 'Password must contain a number' })
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100)
  @Matches(/[A-Za-z]/, { message: 'Password must contain a letter' })
  @Matches(/\d/, { message: 'Password must contain a number' })
  newPassword: string;
}
