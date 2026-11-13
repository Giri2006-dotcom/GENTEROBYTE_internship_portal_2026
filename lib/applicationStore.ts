import fs from 'fs';
import path from 'path';
import mongoose, { Schema, Document } from 'mongoose';

export interface ApplicationData {
  applicationId: string;
  fullName: string;
  email: string;
  confirmEmail: string;
  gender: string;
  whatsapp: string;
  country: string;
  college: string;
  collegeMail: string;
  degree: string;
  branch: string;
  graduationYear: string;
  githubUrl: string;
  portfolioUrl: string;
  skills: string;
  whyApply: string;
  domain: string;
  resumeUrl?: string;
  resumeFileName?: string;
  resumeFileSize?: number;
  resumeFileType?: string;
  resumeBase64?: string;
  consent: boolean;
  status: 'Under Review' | 'Shortlisted' | 'Technical Interview' | 'Interview Scheduled' | 'Offer Extended' | 'Accepted' | 'Rejected';
  reviewerNotes?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface IApplicationModel extends Document, Omit<ApplicationData, 'applicationId'> {
  applicationId: string;
}

const ApplicationSchema = new Schema<IApplicationModel>(
  {
    applicationId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    confirmEmail: { type: String, required: true, lowercase: true, trim: true },
    gender: { type: String, required: true },
    whatsapp: { type: String, required: true },
    country: { type: String, required: true },
    college: { type: String, required: true },
    collegeMail: { type: String, required: true, lowercase: true },
    degree: { type: String, required: true },
    branch: { type: String, required: true },
    graduationYear: { type: String, required: true },
    githubUrl: { type: String, required: true },
    portfolioUrl: { type: String, required: true },
    skills: { type: String, required: true },
    whyApply: { type: String, required: true },
    domain: { type: String, required: true, index: true },
    resumeUrl: { type: String },
    resumeFileName: { type: String },
    resumeFileSize: { type: Number },
    resumeFileType: { type: String },
    resumeBase64: { type: String },
    consent: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ['Under Review', 'Shortlisted', 'Technical Interview', 'Interview Scheduled', 'Offer Extended', 'Accepted', 'Rejected'],
      default: 'Under Review',
    },
    reviewerNotes: { type: String },
    submittedAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

const MongooseApp = mongoose.models.Application || mongoose.model<IApplicationModel>('Application', ApplicationSchema);

// File-based persistence fallback
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'applications.json');

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Failed to initialize local data directory:', err);
  }
}

function readLocalApplications(): ApplicationData[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading local applications:', err);
    return [];
  }
}

function writeLocalApplications(apps: ApplicationData[]): void {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed writing local applications:', err);
  }
}

let isMongoConnected = false;

async function checkMongoConnection(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return false;
  if (isMongoConnected && mongoose.connection.readyState === 1) return true;

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    isMongoConnected = true;
    return true;
  } catch {
    isMongoConnected = false;
    return false;
  }
}

export async function findApplicationByEmailAndDomain(
  email: string,
  domain: string
): Promise<ApplicationData | null> {
  const cleanEmail = email.toLowerCase().trim();
  const cleanDomain = domain.trim();

  const hasMongo = await checkMongoConnection();
  if (hasMongo) {
    try {
      const doc = await MongooseApp.findOne({ email: cleanEmail, domain: cleanDomain }).lean();
      if (doc) return doc as unknown as ApplicationData;
    } catch (e) {
      console.warn('Mongo find error, falling back to local file:', e);
    }
  }

  const localApps = readLocalApplications();
  return (
    localApps.find(
      (a) => a.email.toLowerCase() === cleanEmail && a.domain.toLowerCase() === cleanDomain.toLowerCase()
    ) || null
  );
}

export async function saveApplication(app: ApplicationData): Promise<ApplicationData> {
  const hasMongo = await checkMongoConnection();
  if (hasMongo) {
    try {
      await MongooseApp.findOneAndUpdate(
        { applicationId: app.applicationId },
        { ...app, updatedAt: new Date().toISOString() },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('Mongo save error, saving locally:', e);
    }
  }

  // Always keep local persistent backup
  const localApps = readLocalApplications();
  const existingIdx = localApps.findIndex((a) => a.applicationId === app.applicationId);
  if (existingIdx >= 0) {
    localApps[existingIdx] = app;
  } else {
    localApps.push(app);
  }
  writeLocalApplications(localApps);

  return app;
}

export async function getApplicationById(
  applicationId: string,
  email?: string
): Promise<ApplicationData | null> {
  const cleanId = applicationId.trim();
  const cleanEmail = email ? email.toLowerCase().trim() : undefined;

  const hasMongo = await checkMongoConnection();
  if (hasMongo) {
    try {
      const query: Record<string, string> = { applicationId: cleanId };
      if (cleanEmail) query.email = cleanEmail;
      const doc = await MongooseApp.findOne(query).lean();
      if (doc) return doc as unknown as ApplicationData;
    } catch (e) {
      console.warn('Mongo query error, falling back to local file:', e);
    }
  }

  const localApps = readLocalApplications();
  return (
    localApps.find((a) => {
      const matchId = a.applicationId.toLowerCase() === cleanId.toLowerCase();
      if (!cleanEmail) return matchId;
      return matchId && a.email.toLowerCase() === cleanEmail;
    }) || null
  );
}

export async function getAllApplications(): Promise<ApplicationData[]> {
  const hasMongo = await checkMongoConnection();
  if (hasMongo) {
    try {
      const docs = await MongooseApp.find().sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) return docs as unknown as ApplicationData[];
    } catch (e) {
      console.warn('Mongo getAllApplications error, falling back to local file:', e);
    }
  }

  const localApps = readLocalApplications();
  return [...localApps].reverse();
}

export async function getApplicationsByEmail(email: string): Promise<ApplicationData[]> {
  const cleanEmail = email.toLowerCase().trim();
  const hasMongo = await checkMongoConnection();
  if (hasMongo) {
    try {
      const docs = await MongooseApp.find({ email: cleanEmail }).sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) return docs as unknown as ApplicationData[];
    } catch (e) {
      console.warn('Mongo getApplicationsByEmail error, falling back to local file:', e);
    }
  }

  const localApps = readLocalApplications();
  return localApps.filter((a) => a.email.toLowerCase() === cleanEmail);
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationData['status'],
  reviewerNotes?: string
): Promise<ApplicationData | null> {
  const existing = await getApplicationById(applicationId);
  if (!existing) return null;

  const updated: ApplicationData = {
    ...existing,
    status,
    reviewerNotes: reviewerNotes !== undefined ? reviewerNotes : existing.reviewerNotes,
    updatedAt: new Date().toISOString(),
  };

  return await saveApplication(updated);
}
