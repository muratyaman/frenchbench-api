import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';
import { IConfig } from './config';

export interface IEmail {
  to: string; // TODO can be array
  subject: string;
  text: string;
  html: string;
}

export interface IEmailMgr {
  transport: Transporter;
  sendEmail(email: IEmail): Promise<SentMessageInfo>;
}

export function newEmailMgr(config: IConfig): IEmailMgr {
  
  const transport = nodemailer.createTransport(config.smtp.transportOptions);

  async function sendEmail({ to, subject, text, html }: IEmail): Promise<SentMessageInfo> {
    return transport.sendMail({
      from: config.smtp.emailFrom,
      to, subject, text, html,
    });
  }

  return {
    transport,
    sendEmail,
  };
}
