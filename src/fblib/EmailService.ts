import { Transporter, SentMessageInfo } from 'nodemailer';
import { IConfig } from './config';

export interface IEmail {
  to: string; // TODO can be array
  subject: string;
  text: string;
  html: string;
}

export class EmailService {
  constructor(private config: IConfig, private transport: Transporter) {}

  async sendEmail({ to, subject, text, html }: IEmail): Promise<SentMessageInfo> {
    return this.transport.sendMail({
      from: this.config.smtp.emailFrom,
      to, subject, text, html,
    });
  }
}
