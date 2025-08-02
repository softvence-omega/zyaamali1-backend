import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import config from '../config';

dotenv.config();  

export const sendTeamInviteEmail = async (email: string, html: any) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_AUTH_USER,
      pass: process.env.SMTP_AUTH_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"${'Adelo Ai | Your Ai Solution'}" <${config.smtp_auth_user}>`,
    to: email,
    subject: 'Your Team Invitation & Login Credentials',
    text: 'Hello world?',
    html
  });

  console.log('Message sent:', info.messageId);
  return info;
};
