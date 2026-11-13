require('dotenv').config();
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || process.env.EMAIL || 'dummixyz123@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'enpi qwer jcud uzcf';

// Maintain a persistent singleton connection pool across all Next.js API requests
function getOrCreateTransporter() {
  if (globalThis._gentrobytePooledTransporter) {
    return globalThis._gentrobytePooledTransporter;
  }

  const cleanPass = (EMAIL_PASS || '').replace(/\s+/g, '');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL for direct fast connection
    pool: true, // Re-use open sockets to avoid multi-second TLS handshakes on every send
    maxConnections: 5,
    maxMessages: 100,
    auth: {
      user: EMAIL_USER,
      pass: cleanPass,
    },
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });

  globalThis._gentrobytePooledTransporter = transporter;
  return transporter;
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
    const transporter = getOrCreateTransporter();

    const mailOptions = {
      from: `"Gentrobyte Admissions" <${EMAIL_USER}>`,
      to: recipientEmail,
      subject: `[${otp}] Your Gentrobyte Verification Code`,
      priority: 'high',
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        Importance: 'High',
      },
      text: `Your Gentrobyte verification code is: ${otp}\n\nThis single-use code is valid for 10 minutes.\n\nIf you did not request this code, please disregard this email.\n\nBest regards,\nGentrobyte Admissions Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 44px; height: 44px; background: #2563eb; color: #ffffff; border-radius: 12px; font-size: 22px; font-weight: 800; line-height: 44px;">G</div>
            <h2 style="color: #0f172a; margin: 12px 0 2px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Gentrobyte Technologies</h2>
            <p style="color: #64748b; font-size: 12px; margin: 0; font-weight: 600;">Admissions &amp; Talent Verification</p>
          </div>

          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
            Hello,
          </p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Use the official One-Time Password (OTP) below to authenticate your candidate profile:
          </p>

          <div style="background-color: #f8fafc; border: 2px dashed #93c5fd; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8; font-family: monospace;">${otp}</span>
            <p style="color: #64748b; font-size: 11px; margin: 8px 0 0 0; font-weight: 600;">Valid for 10 minutes • Single Use Only</p>
          </div>

          <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="color: #1e40af; font-size: 12px; margin: 0; line-height: 1.5;">
              <strong>Security Notice:</strong> Gentrobyte staff will never ask for your verification code. If you did not initiate this request, you can safely ignore this email.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
            © 2026 Gentrobyte Technologies Inc. • Automated Admissions Dispatcher
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`[MAILER SUCCESS] OTP email dispatched to ${recipientEmail} (ID: ${result.messageId})`);
    liveDelivered = true;
  } catch (error) {
    deliveryError = error.message;
    console.warn(`[GENTROBYTE MAILER NOTICE] Primary SSL delivery failed (${error.message}). Attempting port 587 fallback...`);

    // Fallback attempt with port 587 if port 465 is filtered by host
    try {
      const fallbackTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: EMAIL_USER,
          pass: (EMAIL_PASS || '').replace(/\s+/g, ''),
        },
      });

      const fallbackOptions = {
        from: `"Gentrobyte Admissions" <${EMAIL_USER}>`,
        to: recipientEmail,
        subject: `[${otp}] Your Gentrobyte Verification Code`,
        text: `Your Gentrobyte verification code is: ${otp}\n\nValid for 10 minutes.`,
      };

      await fallbackTransporter.sendMail(fallbackOptions);
      liveDelivered = true;
      deliveryError = null;
      console.log(`[MAILER SUCCESS] Fallback delivery successful to ${recipientEmail}`);
    } catch (fallbackError) {
      deliveryError = `${error.message}; Fallback: ${fallbackError.message}`;
      console.error(`[MAILER FATAL] Both delivery strategies failed: ${deliveryError}`);
    }
  }

  return { otp, liveDelivered, error: deliveryError };
}

async function sendConfirmationEmail(recipientEmail, { applicationId, fullName, domain }) {
  if (!recipientEmail) {
    throw new Error('recipientEmail is required');
  }

  try {
    const transporter = getOrCreateTransporter();

    const mailOptions = {
      from: `"Gentrobyte Admissions" <${EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Application Received: ${domain} (ID: ${applicationId}) - Gentrobyte`,
      text: `Hello ${fullName},\n\nThank you for applying for the ${domain} internship at Gentrobyte!\nYour Application ID is: ${applicationId}\n\nOur team is currently reviewing your profile.\n\nBest regards,\nGentrobyte Team`,
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
            <li>Our review team will evaluate your credentials within 5-7 business days.</li>
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
    console.warn(`[GENTROBYTE MAILER NOTICE] Confirmation email failed (${error.message})`);
    return null;
  }
}

module.exports = {
  sendOtpEmail,
  sendConfirmationEmail,
};
