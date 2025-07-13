// utils/email.ts
import nodemailer from 'nodemailer';
import config from '../config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: config.node_env === 'production',
    auth: {
      user: config.smtp_auth_user,
      pass: config.smtp_auth_pass,
    },
  });

  await transporter.sendMail({
    from: `"YourApp" <${config.smtp_auth_user}>`,
    to,
    subject,
    text: '', // optional plain text
    html,
  });
};
