import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.config.get('SMTP_PORT', 587)),
        secure: this.config.get('SMTP_SECURE') === 'true',
        auth: this.config.get('SMTP_USER')
          ? { user: this.config.get('SMTP_USER'), pass: this.config.get('SMTP_PASS') }
          : undefined,
      });
    }
  }

  get isConfigured() {
    return this.transporter !== null;
  }

  async send(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.log(`[mail disabled] to=${to} subject="${subject}"`);
      return false;
    }
    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM', 'TableNest <no-reply@tablenest.app>'),
        to,
        subject,
        html,
      });
      return true;
    } catch (err) {
      this.logger.error(`Mail send failed: ${(err as Error).message}`);
      return false;
    }
  }
}
