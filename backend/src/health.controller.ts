import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class HealthController {
  constructor(@InjectConnection() private connection: Connection) {}

  /** Liveness + readiness: 200 only when the database answers a ping. */
  @Get('health')
  async health() {
    try {
      await this.connection.db!.admin().ping();
    } catch {
      throw new ServiceUnavailableException({ status: 'degraded', database: 'unreachable' });
    }
    return { status: 'ok', database: 'up', uptime: Math.round(process.uptime()), time: new Date().toISOString() };
  }
}
