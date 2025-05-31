import nodemailer from 'nodemailer';
import config from '../config';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';

// Reusable email sender
const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: config.node_env === 'production',
    auth: {
       user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${config.PROJECT_NAME || 'Your App'}" <${config.smtp_auth_user}>`,
    to,
    subject,
    html,
  });
};

// Send Verification Email with code
export const sendVerificationEmail = async (to: string, code: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 24px; border: 1px solid #e0e0e0;">
      <h2 style="color: #333333;">Verify Your Email Address</h2>
      <p style="color: #555555; font-size: 16px;">Thank you for registering with us! To complete your registration, please use the verification code below:</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <div style="display: inline-block; background: #f3f4f6; padding: 12px 24px; font-size: 24px; color: #111827; font-weight: bold; border-radius: 6px; letter-spacing: 4px;">
          ${code}
        </div>
      </div>

      <p style="color: #666666; font-size: 14px;">This code will expire in <strong>10 minutes</strong>. If you did not initiate this request, you can safely ignore this email.</p>
      
      <p style="color: #999999; font-size: 12px; margin-top: 24px;">Regards,<br>Your App Team</p>
    </div>
  `;

  try {
    await sendEmail(to, 'Verify Your Email Address', html);
  } catch (error: any) {
    if (error.code === 'EAUTH') {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to send verification email. Please check your email configuration.'
      );
    }

    // Fallback for other email errors
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong while sending the verification email.'
    );
  }
};
