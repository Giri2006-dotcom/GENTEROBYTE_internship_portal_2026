const fs = require('fs');
const path = require('path');

// Preserve singletons across Next.js API route instances and fast-reloads
const globalStore = globalThis;
if (!globalStore._gentrobyteOtpStore) {
  globalStore._gentrobyteOtpStore = new Map();
}
if (!globalStore._gentrobyteVerifiedUsers) {
  globalStore._gentrobyteVerifiedUsers = new Map();
}

const memoryOtpStore = globalStore._gentrobyteOtpStore;
const memoryVerifiedUsers = globalStore._gentrobyteVerifiedUsers;

const DATA_DIR = path.join(process.cwd(), 'data');
const OTPS_FILE = path.join(DATA_DIR, 'otps.json');
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes expiry window
const VERIFY_WINDOW_MS = 30 * 60 * 1000; // 30 minutes verification grace window

function readDiskOtps() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(OTPS_FILE)) {
      const content = fs.readFileSync(OTPS_FILE, 'utf8');
      return JSON.parse(content) || {};
    }
  } catch {
    // Filesystem may be read-only in some cloud environments
  }
  return {};
}

function writeDiskOtps(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(OTPS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Fall back silently to in-memory store
  }
}

function saveOtp(email, otp) {
  if (!email || !otp) return;
  const key = email.toLowerCase().trim();
  const cleanOtp = String(otp).trim().replace(/\D/g, '');
  const now = Date.now();

  let existing = memoryOtpStore.get(key);
  if (!existing) {
    const disk = readDiskOtps();
    existing = disk[key];
  }

  // Preserve all non-expired codes for this email so recent resends don't invalidate delivery
  const activeCodes = (existing && Array.isArray(existing.codes))
    ? existing.codes.filter(c => now - c.createdAt < OTP_TTL_MS)
    : [];

  // Also migrate legacy single-otp record if present and valid
  if (existing && existing.otp && (now - (existing.createdAt || 0) < OTP_TTL_MS)) {
    const legacyOtp = String(existing.otp).trim().replace(/\D/g, '');
    if (!activeCodes.some(c => c.otp === legacyOtp)) {
      activeCodes.push({ otp: legacyOtp, createdAt: existing.createdAt || now });
    }
  }

  activeCodes.push({ otp: cleanOtp, createdAt: now });

  const record = {
    otp: cleanOtp,
    codes: activeCodes,
    createdAt: now,
    attempts: 0,
    verified: false,
    verifiedAt: null,
  };

  memoryOtpStore.set(key, record);

  const diskOtps = readDiskOtps();
  diskOtps[key] = record;
  writeDiskOtps(diskOtps);
}

function verifyOtp(email, otp) {
  if (!email) return false;
  const key = email.toLowerCase().trim();
  const cleanInput = String(otp || '').trim().replace(/\D/g, '');
  const now = Date.now();

  // If candidate was already verified in the last 30 minutes, accept
  if (isVerified(key)) {
    return true;
  }

  if (cleanInput.length !== 6) return false;

  let record = memoryOtpStore.get(key);
  let diskOtps = null;
  if (!record) {
    diskOtps = readDiskOtps();
    record = diskOtps[key];
  }

  if (!record) {
    return false;
  }

  // Check matching against all active codes
  let matches = false;
  if (Array.isArray(record.codes) && record.codes.length > 0) {
    matches = record.codes.some(
      c => (now - c.createdAt <= OTP_TTL_MS) && String(c.otp).trim().replace(/\D/g, '') === cleanInput
    );
  } else if (record.otp) {
    const isExpired = now - record.createdAt > OTP_TTL_MS;
    if (!isExpired && String(record.otp).trim().replace(/\D/g, '') === cleanInput) {
      matches = true;
    }
  }

  if (!matches) {
    record.attempts = (record.attempts || 0) + 1;
    if (record.attempts >= 6) {
      memoryOtpStore.delete(key);
      if (!diskOtps) diskOtps = readDiskOtps();
      delete diskOtps[key];
      writeDiskOtps(diskOtps);
    }
    return false;
  }

  // Successful verification - retain verified status for 30 minutes
  record.verified = true;
  record.verifiedAt = now;
  memoryOtpStore.set(key, record);
  memoryVerifiedUsers.set(key, now);

  if (!diskOtps) diskOtps = readDiskOtps();
  diskOtps[key] = record;
  if (!diskOtps.verifiedMap) diskOtps.verifiedMap = {};
  diskOtps.verifiedMap[key] = now;
  writeDiskOtps(diskOtps);

  return true;
}

function isVerified(email) {
  if (!email) return false;
  const key = email.toLowerCase().trim();
  const now = Date.now();

  const memTime = memoryVerifiedUsers.get ? memoryVerifiedUsers.get(key) : null;
  if (memTime && (now - memTime < VERIFY_WINDOW_MS)) {
    return true;
  }

  const record = memoryOtpStore.get(key);
  if (record && record.verified && (now - (record.verifiedAt || record.createdAt) < VERIFY_WINDOW_MS)) {
    return true;
  }

  const diskOtps = readDiskOtps();
  if (diskOtps.verifiedMap && diskOtps.verifiedMap[key] && (now - diskOtps.verifiedMap[key] < VERIFY_WINDOW_MS)) {
    return true;
  }
  if (diskOtps[key] && diskOtps[key].verified && (now - (diskOtps[key].verifiedAt || diskOtps[key].createdAt) < VERIFY_WINDOW_MS)) {
    return true;
  }
  if (diskOtps._verified && Array.isArray(diskOtps._verified) && diskOtps._verified.includes(key)) {
    return true;
  }

  return false;
}

function clearOtp(email) {
  if (!email) return;
  const key = email.toLowerCase().trim();
  memoryOtpStore.delete(key);
  if (memoryVerifiedUsers.delete) memoryVerifiedUsers.delete(key);
  const disk = readDiskOtps();
  delete disk[key];
  if (disk.verifiedMap) delete disk.verifiedMap[key];
  if (disk._verified && Array.isArray(disk._verified)) {
    disk._verified = disk._verified.filter(k => k !== key);
  }
  writeDiskOtps(disk);
}

module.exports = {
  saveOtp,
  verifyOtp,
  isVerified,
  clearOtp,
};
