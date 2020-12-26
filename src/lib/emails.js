import nodemailer from 'nodemailer';

export function newEmailMgr({ config }) {
  
  const transport = nodemailer.createTransport(config.smtp.transportOptions);

  async function sendEmail({ to, subject, text, html }) {
    return transporter.sendMail({
      from: config.smtp.emailFrom,
      to, subject, text, html,
    });
  }

  return {
    transport,
    sendEmail,
  };
}
