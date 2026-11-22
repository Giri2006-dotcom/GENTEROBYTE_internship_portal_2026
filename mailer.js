require('dotenv').config();
const dns = require('dns').promises;
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || process.env.EMAIL || 'dummixyz123@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'enpi qwer jcud uzcf';

// Cache resolved IPv4 host to guarantee zero IPv6 lookup attempts on Render / AWS containers
let cachedIpv4Host = null;
let lastDnsResolution = 0;

async function getIpv4SmtpHost() {
  const now = Date.now();
  if (cachedIpv4Host && now - lastDnsResolution < 10 * 60 * 1000) {
    return cachedIpv4Host;
  }

  try {
    const addresses = await dns.resolve4('smtp.gmail.com');
    if (addresses && addresses.length > 0) {
      cachedIpv4Host = addresses[0];
      lastDnsResolution = now;
      return cachedIpv4Host;
    }
  } catch (err) {
    console.warn('[MAILER] DNS resolve4 warning, falling back to default:', err.message);
  }

  return 'smtp.gmail.com';
}

async function createIpv4Transporter(port = 465, secure = true) {
  const ipHost = await getIpv4SmtpHost();
  const cleanPass = (EMAIL_PASS || '').replace(/\s+/g, '');

  return nodemailer.createTransport({
    host: ipHost,
    port,
    secure,
    servername: 'smtp.gmail.com', // Crucial: sets TLS SNI to match Google certificate
    auth: {
      user: EMAIL_USER,
      pass: cleanPass,
    },
    tls: {
      servername: 'smtp.gmail.com',
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    },
    connectionTimeout: 4000,
    greetingTimeout: 4000,
    socketTimeout: 5000,
  });
}

// Strategy A: HTTPS REST API via Resend (Port 443 - NEVER blocked by cloud firewalls like Render Free Tier)
async function tryResendHttps(recipientEmail, otp, htmlContent) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'Gentrobyte Admissions <onboarding@resend.dev>',
        to: [recipientEmail],
        subject: `[${otp}] Your Gentrobyte Verification Code`,
        html: htmlContent,
      }),
    });

    const data = await res.json();
    if (res.ok && data.id) {
      console.log(`[MAILER SUCCESS] Dispatched via Resend HTTPS (ID: ${data.id}) to ${recipientEmail}`);
      return { delivered: true, id: data.id };
    }
    console.warn('[MAILER RESEND ERROR RESPONSE]:', data);
    return { delivered: false, error: data.message || 'Resend API returned error' };
  } catch (err) {
    console.warn('[MAILER RESEND EXCEPTION]:', err.message);
    return { delivered: false, error: err.message };
  }
}

// Strategy B: HTTPS REST API via Brevo (Port 443 - 300 free emails/day to any recipient)
async function tryBrevoHttps(recipientEmail, otp, htmlContent) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Gentrobyte Admissions', email: EMAIL_USER },
        to: [{ email: recipientEmail }],
        subject: `[${otp}] Your Gentrobyte Verification Code`,
        htmlContent: htmlContent,
      }),
    });

    const data = await res.json();
    if (res.ok && (data.messageId || data.messageIds)) {
      console.log(`[MAILER SUCCESS] Dispatched via Brevo HTTPS to ${recipientEmail}`);
      return { delivered: true, id: data.messageId || 'brevo-success' };
    }
    return { delivered: false, error: data.message || 'Brevo API error' };
  } catch (err) {
    return { delivered: false, error: err.message };
  }
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

  const htmlContent = `
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
  `;

  // 1. Try Resend HTTPS API if configured (Port 443 - zero firewall interference)
  const resendAttempt = await tryResendHttps(recipientEmail, otp, htmlContent);
  if (resendAttempt && resendAttempt.delivered) {
    return { otp, liveDelivered: true, error: null };
  }

  // 2. Try Brevo HTTPS API if configured (Port 443 - zero firewall interference)
  const brevoAttempt = await tryBrevoHttps(recipientEmail, otp, htmlContent);
  if (brevoAttempt && brevoAttempt.delivered) {
    return { otp, liveDelivered: true, error: null };
  }

  // 3. Try Direct IPv4 SMTP SSL (Port 465)
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
    text: `Your Gentrobyte verification code is: ${otp}\n\nThis single-use code is valid for 10 minutes.\n\nBest regards,\nGentrobyte Admissions Team`,
    html: htmlContent,
  };

  try {
    const transporter465 = await createIpv4Transporter(465, true);
    const result = await transporter465.sendMail(mailOptions);
    console.log(`[MAILER SUCCESS] Dispatched via IPv4 SSL 465 to ${recipientEmail} (ID: ${result.messageId})`);
    liveDelivered = true;
    return { otp, liveDelivered: true, error: null };
  } catch (error) {
    deliveryError = error.message;
    console.warn(`[MAILER WARNING] IPv4 Port 465 failed (${error.message}). Attempting IPv4 Port 587 fallback...`);
  }

  // 4. Try Direct IPv4 SMTP STARTTLS (Port 587)
  try {
    const transporter587 = await createIpv4Transporter(587, false);
    const result587 = await transporter587.sendMail(mailOptions);
    console.log(`[MAILER SUCCESS] Dispatched via IPv4 TLS 587 to ${recipientEmail} (ID: ${result587.messageId})`);
    liveDelivered = true;
    return { otp, liveDelivered: true, error: null };
  } catch (fallbackError) {
    deliveryError = `SSL 465: ${deliveryError}; TLS 587: ${fallbackError.message}`;
    console.error(`[MAILER FATAL] Direct SMTP blocked by host firewall: ${deliveryError}`);
  }

  return { otp, liveDelivered: false, error: deliveryError };
}

async function sendConfirmationEmail(recipientEmail, { applicationId, fullName, domain }) {
  if (!recipientEmail) {
    throw new Error('recipientEmail is required');
  }

  const htmlContent = `
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
  `;

  // Try Resend HTTPS if available
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Gentrobyte Admissions <onboarding@resend.dev>',
          to: [recipientEmail],
          subject: `Application Received: ${domain} (ID: ${applicationId}) - Gentrobyte`,
          html: htmlContent,
        }),
      });
      if (res.ok) return res;
    } catch {}
  }

  try {
    const transporter = await createIpv4Transporter(465, true);
    const mailOptions = {
      from: `"Gentrobyte Admissions" <${EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Application Received: ${domain} (ID: ${applicationId}) - Gentrobyte`,
      text: `Hello ${fullName},\n\nThank you for applying for the ${domain} internship at Gentrobyte!\nYour Application ID is: ${applicationId}\n\nOur team is currently reviewing your profile.\n\nBest regards,\nGentrobyte Team`,
      html: htmlContent,
    };
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.warn(`[GENTROBYTE MAILER NOTICE] Confirmation email failed (${error.message})`);
    return null;
  }
}

module.exports = {
  sendOtpEmail,
  sendConfirmationEmail,
};
