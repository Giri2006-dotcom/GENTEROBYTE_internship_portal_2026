const fs = require('fs');
const path = require('path');

// Preserve singletons across Next.js API route instances and fast-reloads
const globalStore = globalThis;
if (!globalStore._gentrobyteOtpStore) {
  globalStore._gentrobyteOtpStore = new Map();
}
if (!globalStore._gentrobyteVerifiedUsers) {
  globalStore._gentrobyteVerifiedUsers = new Set();
}

const memoryOtpStore = globalStore._gentrobyteOtpStore;
const memoryVerifiedUsers = globalStore._gentrobyteVerifiedUsers;

const DATA_DIR = path.join(process.cwd(), 'data');
const OTPS_FILE = path.join(DATA_DIR, 'otps.json');
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes expiry window

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
  const record = { otp: cleanOtp, createdAt: Date.now(), attempts: 0 };

  // Store in memory
  memoryOtpStore.set(key, record);

  // Store on disk so worker reloads or restarts do not lose active OTPs
  const diskOtps = readDiskOtps();
  diskOtps[key] = record;
  writeDiskOtps(diskOtps);
}

function verifyOtp(email, otp) {
  if (!email || !otp) return false;
  const key = email.toLowerCase().trim();
  const cleanInput = String(otp).trim().replace(/\D/g, '');

  if (cleanInput.length !== 6) return false;

  // Check memory first, then disk
  let record = memoryOtpStore.get(key);
  let diskOtps = null;

  if (!record) {
    diskOtps = readDiskOtps();
    record = diskOtps[key];
  }

  if (!record) {
    return false;
  }

  const isExpired = Date.now() - record.createdAt > OTP_TTL_MS;
  if (isExpired) {
    memoryOtpStore.delete(key);
    if (!diskOtps) diskOtps = readDiskOtps();
    delete diskOtps[key];
    writeDiskOtps(diskOtps);
    return false;
  }

  record.attempts = (record.attempts || 0) + 1;
  const storedOtp = String(record.otp).trim().replace(/\D/g, '');

  if (storedOtp !== cleanInput) {
    if (record.attempts >= 4) {
      memoryOtpStore.delete(key);
      if (!diskOtps) diskOtps = readDiskOtps();
      delete diskOtps[key];
      writeDiskOtps(diskOtps);
    }
    return false;
  }

  // Successful verification
  memoryOtpStore.delete(key);
  memoryVerifiedUsers.add(key);

  if (!diskOtps) diskOtps = readDiskOtps();
  delete diskOtps[key];
  if (!diskOtps._verified) diskOtps._verified = [];
  if (!diskOtps._verified.includes(key)) diskOtps._verified.push(key);
  writeDiskOtps(diskOtps);

  return true;
}

function isVerified(email) {
  if (!email) return false;
  const key = email.toLowerCase().trim();
  if (memoryVerifiedUsers.has(key)) return true;

  const diskOtps = readDiskOtps();
  if (diskOtps._verified && Array.isArray(diskOtps._verified)) {
    return diskOtps._verified.includes(key);
  }
  return false;
}

module.exports = {
  saveOtp,
  verifyOtp,
  isVerified,
};
