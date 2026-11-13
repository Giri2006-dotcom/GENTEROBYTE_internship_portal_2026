import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'applicant' | 'recruiter' | 'admin';
  passwordHash?: string;
  passwordSalt?: string;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === checkHash;
}

let inMemoryUsers: UserRecord[] | null = null;

function ensureUsersFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      // Seed default recruiter account managed by the company
      const defaultRecruiter = hashPassword('Gentrobyte@2026');
      const seedUsers: UserRecord[] = [
        {
          id: 'REC-001',
          name: 'Gentrobyte Talent Acquisition',
          email: 'recruiter@gentrobyte.com',
          role: 'recruiter',
          passwordHash: defaultRecruiter.hash,
          passwordSalt: defaultRecruiter.salt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      fs.writeFileSync(USERS_FILE, JSON.stringify(seedUsers, null, 2), 'utf8');
      inMemoryUsers = seedUsers;
    }
  } catch (err) {
    console.warn('Filesystem read-only or unavailable, using in-memory store:', err);
    if (!inMemoryUsers) {
      const defaultRecruiter = hashPassword('Gentrobyte@2026');
      inMemoryUsers = [
        {
          id: 'REC-001',
          name: 'Gentrobyte Talent Acquisition',
          email: 'recruiter@gentrobyte.com',
          role: 'recruiter',
          passwordHash: defaultRecruiter.hash,
          passwordSalt: defaultRecruiter.salt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  }
}

export function readUsers(): UserRecord[] {
  ensureUsersFile();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf8');
      const users: UserRecord[] = JSON.parse(raw);

      // Ensure company recruiter exists
      const hasRecruiter = users.some((u) => u.role === 'recruiter' && u.email === 'recruiter@gentrobyte.com');
      if (!hasRecruiter) {
        const defaultRecruiter = hashPassword('Gentrobyte@2026');
        users.unshift({
          id: 'REC-001',
          name: 'Gentrobyte Talent Acquisition',
          email: 'recruiter@gentrobyte.com',
          role: 'recruiter',
          passwordHash: defaultRecruiter.hash,
          passwordSalt: defaultRecruiter.salt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        writeUsers(users);
      }

      inMemoryUsers = users;
      return users;
    }
  } catch (err) {
    console.warn('Reading users from disk failed, falling back to memory store:', err);
  }

  if (!inMemoryUsers) {
    const defaultRecruiter = hashPassword('Gentrobyte@2026');
    inMemoryUsers = [
      {
        id: 'REC-001',
        name: 'Gentrobyte Talent Acquisition',
        email: 'recruiter@gentrobyte.com',
        role: 'recruiter',
        passwordHash: defaultRecruiter.hash,
        passwordSalt: defaultRecruiter.salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
  return inMemoryUsers;
}

export function writeUsers(users: UserRecord[]): void {
  inMemoryUsers = users;
  try {
    ensureUsersFile();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.warn('Persisting users to disk failed (expected in read-only serverless lambdas):', err);
  }
}

export function findUserByEmail(email: string): UserRecord | null {
  if (!email || typeof email !== 'string') return null;
  const cleanEmail = email.toLowerCase().trim();
  const users = readUsers();
  return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
}

export function findUserByName(name: string): UserRecord | null {
  if (!name || typeof name !== 'string') return null;
  const cleanName = name.toLowerCase().trim();
  const users = readUsers();
  return users.find((u) => u.name.toLowerCase().trim() === cleanName) || null;
}

export function createUser(data: {
  name: string;
  email: string;
  role?: 'applicant' | 'recruiter';
  password?: string;
}): UserRecord {
  const cleanEmail = data.email.toLowerCase().trim();
  const cleanName = data.name.trim();
  const users = readUsers();

  const existingEmail = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    throw new Error('An account with this email address already exists. Only one account per email is permitted.');
  }

  const existingName = users.find((u) => u.name.toLowerCase().trim() === cleanName.toLowerCase());
  if (existingName) {
    throw new Error(`The candidate username/name "${cleanName}" is already registered. Please use a unique name.`);
  }

  let hash = '';
  let salt = '';
  if (data.password) {
    const p = hashPassword(data.password);
    hash = p.hash;
    salt = p.salt;
  }

  const role = data.role || (cleanEmail.endsWith('@gentrobyte.com') ? 'recruiter' : 'applicant');
  const newUser: UserRecord = {
    id: role === 'recruiter' ? `REC-${Date.now()}` : `APP-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    role,
    passwordHash: hash || undefined,
    passwordSalt: salt || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);
  return newUser;
}
