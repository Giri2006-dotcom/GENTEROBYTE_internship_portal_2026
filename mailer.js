require('dotenv').config();
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || process.env.EMAIL || 'dummixyz123@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'enpi qwer jcud uzcf';
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const REDIRECT_URI = process.env.REDIRECT_URI;

let oauth2Client = null;
if (CLIENT_ID && CLIENT_SECRET && REDIRECT_URI) {
  try {
    oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    if (REFRESH_TOKEN) {
      oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    }
  } catch (err) {
    console.warn('[MAILER] OAuth2 client initialization warning:', err.message);
  }
}

async function createTransporter() {
  // Strategy 1: Direct Gmail App Password (100% Reliable, Never Expires)
  if (EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS.replace(/\s+/g, ''), // Strip spaces from Google 16-character app password format
      },
    });
  }

  // Strategy 2: Google OAuth2 Transporter
  if (oauth2Client && REFRESH_TOKEN) {
    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token;

    if (!accessToken) {
      throw new Error('Google OAuth2 refresh token expired (invalid_grant). Set EMAIL_PASS (16-char App Password) in .env for permanent SMTP delivery.');
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken,
      },
    });
  }

  throw new Error('No valid email transport configured. Please set EMAIL_PASS (16-char Gmail App Password) in .env.');
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(recipientEmail) {
  if (!recipientEmail) {
    throw new Error('recipientEmail is required');
  }

  const otp = generateOtp();
  let liveDelivered = false;
  let deliveryError = null;

  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"Gentrobyte Admissions" <${EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Your Gentrobyte Application Verification Code',
      text: `Hello from Gentrobyte!\n\nYour 6-digit verification code is: ${otp}\n\nThis code expires in 5 minutes. Please do not share this code with anyone.\n\nBest regards,\nGentrobyte Talent Acquisition`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: #2563eb; color: #ffffff; border-radius: 12px; font-size: 24px; font-weight: bold; line-height: 48px;">G</div>
            <h2 style="color: #0f172a; margin: 12px 0 4px 0; font-size: 22px; font-weight: 800;">Gentrobyte Technologies</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0;">Internship Admissions & Talent Verification</p>
          </div>

          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
            Hello,
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Please use the official One-Time Password (OTP) below to authenticate your candidate profile:
          </p>

          <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #1e40af; font-family: monospace;">${otp}</span>
            <p style="color: #64748b; font-size: 12px; margin: 8px 0 0 0;">Valid for 5 minutes • Single Use Only</p>
          </div>

          <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="color: #1e40af; font-size: 12px; margin: 0; line-height: 1.5;">
              <strong>Security Notice:</strong> Gentrobyte staff will never ask for your verification code. If you did not initiate this request, you can safely ignore this email.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
            © 2026 Gentrobyte Technologies Inc. • Automated Admissions Dispatcher
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`[MAILER SUCCESS] OTP email delivered to ${recipientEmail} (ID: ${result.messageId})`);
    liveDelivered = true;
  } catch (error) {
    deliveryError = error.message;
    console.warn(`[GENTROBYTE MAILER NOTICE] Live email dispatch failed (${error.message}). Generated OTP:`, otp);
  }

  return { otp, liveDelivered, error: deliveryError };
}

async function sendConfirmationEmail(recipientEmail, { applicationId, fullName, domain }) {
  if (!recipientEmail) {
    throw new Error('recipientEmail is required');
  }

  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"Gentrobyte Admissions" <${EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Application Received: ${domain} (ID: ${applicationId}) - Gentrobyte`,
      text: `Hello ${fullName},\n\nThank you for applying for the ${domain} internship at Gentrobyte!\nYour Application ID is: ${applicationId}\n\nOur team is currently reviewing your profile and will update you within 5-7 business days.\n\nBest regards,\nGentrobyte Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px;">Gentrobyte Internship 2026</h1>
            <p style="color: #2563eb; font-weight: bold; margin-top: 4px;">Application Received Successfully</p>
          </div>
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">Dear <strong>${fullName}</strong>,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Thank you for submitting your application for the <strong>${domain}</strong> internship position.</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">YOUR APPLICATION ID</p>
            <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: bold; color: #0f172a; font-family: monospace;">${applicationId}</p>
          </div>

          <p style="color: #334155; font-size: 15px; line-height: 1.5;"><strong>Next Steps:</strong></p>
          <ul style="color: #475569; font-size: 14px; line-height: 1.6;">
            <li>Our review team will evaluate your credentials and portfolio within 5-7 business days.</li>
            <li>You can track your live evaluation progress at any time using your Application ID.</li>
          </ul>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 Gentrobyte. All rights reserved.</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to', recipientEmail, result.messageId);
    return result;
  } catch (error) {
    console.warn(`[GENTROBYTE MAILER NOTICE] Live confirmation email dispatch failed (${error.message}). Logged for record:`, {
      recipientEmail,
      applicationId,
    });
    return null;
  }
}

module.exports = {
  sendOtpEmail,
  sendConfirmationEmail,
};
