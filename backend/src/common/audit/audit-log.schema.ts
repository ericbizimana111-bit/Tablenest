import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

/** Append-only record of security-relevant and administrative actions. */
@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class AuditLog {
  @Prop({ default: null, type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  actorId: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  actorRole: string | null;

  /** Dotted verb, e.g. `order.status_changed`, `admin.user_updated`. */
  @Prop({ required: true, index: true })
  action: string;

  @Prop({ type: String, default: null })
  targetType: string | null;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId, index: true })
  targetId: Types.ObjectId | null;

  @Prop({ type: Object, default: {} })
  meta: Record<string, unknown>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ createdAt: -1 });
