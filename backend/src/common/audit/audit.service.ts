import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit-log.schema';

type AuditActor = { _id: { toString(): string }; role?: string } | null | undefined;

@Injectable()
export class AuditService {
  private readonly logger = new Logger('Audit');

  constructor(@InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>) {}

  /**
   * Records an action. Never throws — an audit write failure must not roll back or fail the
   * business operation it describes; it is logged instead.
   */
  async record(actor: AuditActor, action: string, target?: { type: string; id: { toString(): string } }, meta: Record<string, unknown> = {}) {
    const actorId = actor?._id ? actor._id.toString() : null;
    const targetId = target?.id ? target.id.toString() : null;
    this.logger.log(`${action} actor=${actorId ?? 'system'}${target ? ` ${target.type}=${targetId}` : ''}`);
    try {
      await this.auditModel.create({
        actorId: actorId ? new Types.ObjectId(actorId) : null,
        actorRole: actor?.role ?? 'system',
        action,
        targetType: target?.type ?? null,
        targetId: targetId && Types.ObjectId.isValid(targetId) ? new Types.ObjectId(targetId) : null,
        meta,
      });
    } catch (err) {
      this.logger.error(`audit write failed for ${action}: ${(err as Error).message}`);
    }
  }
}
