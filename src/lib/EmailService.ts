import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';
import { IConfig } from './config';

export interface IEmail {
  to: string; // TODO can be array
  subject: string;
  text: string;
  html: string;
}

export class EmailService {
  
  private transport: Transporter;

  constructor(private config: IConfig) {
    this.transport = nodemailer.createTransport(this.config.smtp.transportOptions);
  }

  async sendEmail({ to, subject, text, html }: IEmail): Promise<SentMessageInfo> {
    return this.transport.sendMail({
      from: this.config.smtp.emailFrom,
      to, subject, text, html,
    });
  }
}
