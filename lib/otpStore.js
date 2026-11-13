// Preserve singletons across Next.js API route instances and fast-reloads
const globalStore = globalThis;
if (!globalStore._gentrobyteOtpStore) {
  globalStore._gentrobyteOtpStore = new Map();
}
if (!globalStore._gentrobyteVerifiedUsers) {
  globalStore._gentrobyteVerifiedUsers = new Set();
}

const otpStore = globalStore._gentrobyteOtpStore;
const verifiedUsers = globalStore._gentrobyteVerifiedUsers;

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

function saveOtp(email, otp) {
  const key = email.toLowerCase().trim();
  otpStore.set(key, { otp, createdAt: Date.now(), attempts: 0 });
}

function verifyOtp(email, otp) {
  const key = email.toLowerCase().trim();
  const record = otpStore.get(key);
  if (!record) {
    return false;
  }

  const isExpired = Date.now() - record.createdAt > OTP_TTL_MS;
  if (isExpired) {
    otpStore.delete(key);
    return false;
  }

  record.attempts = (record.attempts || 0) + 1;
  if (record.otp !== otp) {
    if (record.attempts >= 3) {
      otpStore.delete(key);
    }
    return false;
  }

  otpStore.delete(key);
  verifiedUsers.add(key);
  return true;
}

function isVerified(email) {
  return verifiedUsers.has(email.toLowerCase().trim());
}

module.exports = {
  saveOtp,
  verifyOtp,
  isVerified,
};
