import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Disable default body parser limit for file uploads (allow up to 10MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { fileName, fileType, fileBase64, fileSize } = req.body || {};

    if (!fileName || !fileBase64) {
      return res.status(400).json({
        success: false,
        message: 'Missing file data. Please select a valid document to upload.',
      });
    }

    // 1. Validate File Extension
    const ext = path.extname(fileName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported file format (${ext}). Only PDF, DOC, and DOCX files are permitted.`,
      });
    }

    // 2. Validate MIME Type if provided
    if (fileType && !ALLOWED_MIME_TYPES.includes(fileType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid document type (${fileType}). Please upload a valid PDF or Word document.`,
      });
    }

    // 3. Extract and Decode Base64 Data
    const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, '');
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // 4. Validate File Size
    const actualSize = fileBuffer.length;
    if (actualSize > MAX_FILE_SIZE_BYTES || (fileSize && fileSize > MAX_FILE_SIZE_BYTES)) {
      return res.status(400).json({
        success: false,
        message: `File exceeds maximum allowed limit of 5MB (Actual size: ${(actualSize / (1024 * 1024)).toFixed(2)} MB).`,
      });
    }

    // 5. Ensure Upload Directory Exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 6. Generate Sanitized Unique Filename
    const safeBaseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const sanitizedFileName = `${safeBaseName}_${uniqueSuffix}${ext}`;
    const targetFilePath = path.join(uploadDir, sanitizedFileName);

    // 7. Write File to Storage
    fs.writeFileSync(targetFilePath, fileBuffer);

    const publicUrl = `/api/resumes/${sanitizedFileName}`;
    const legacyUrl = `/uploads/resumes/${sanitizedFileName}`;

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully to secure storage!',
      fileUrl: publicUrl,
      legacyUrl,
      fileName: sanitizedFileName,
      originalName: fileName,
      fileSize: actualSize,
      fileType: ext === '.pdf' ? 'application/pdf' : 'application/msword',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[RESUME UPLOAD ERROR]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error processing file upload.',
    });
  }
}
