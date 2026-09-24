import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PartialType } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { Staff, StaffDocument } from './staff.schema';
import { AccessControlService, Actor } from '../../common/services/access-control.service';
import { EmptyToNull, Trim } from '../../common/validation/validators';

export class CreateStaffDto {
  @Trim()
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  @MaxLength(80)
  name: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Enter a valid email address' })
  email: string;

  @IsOptional()
  @EmptyToNull()
  @Matches(/^\+?[\d\s()-]{6,20}$/, { message: 'Enter a valid phone number' })
  phone?: string | null;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(40)
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}

/** Staff directory for a restaurant (contact list; staff members do not get platform logins). */
@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
    private access: AccessControlService,
  ) {}

  private async owned(user: Actor, id: string) {
    const doc = await this.staffModel.findById(id);
    if (!doc) throw new NotFoundException('Staff member not found');
    await this.access.assertRestaurantOwner(user, doc.restaurantId.toString());
    return doc;
  }

  async findByRestaurant(user: Actor, restaurantId: string) {
    await this.access.assertRestaurantOwner(user, restaurantId);
    return this.staffModel.find({ restaurantId }).sort({ name: 1 }).limit(500);
  }

  async create(user: Actor, dto: CreateStaffDto) {
    const restaurantId = await this.access.getOwnerRestaurantId(user);
    if (await this.staffModel.exists({ restaurantId, email: dto.email })) {
      throw new ConflictException('A staff member with this email already exists');
    }
    return this.staffModel.create({ ...dto, role: dto.role || 'Server', restaurantId });
  }

  async update(user: Actor, id: string, dto: UpdateStaffDto) {
    const doc = await this.owned(user, id);
    if (dto.email && dto.email !== doc.email && (await this.staffModel.exists({ restaurantId: doc.restaurantId, email: dto.email }))) {
      throw new ConflictException('A staff member with this email already exists');
    }
    return this.staffModel.findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after' });
  }

  async delete(user: Actor, id: string) {
    await this.owned(user, id);
    await this.staffModel.findByIdAndDelete(id);
    return { message: 'Staff member removed' };
  }
}
