import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { filename } = req.query;
  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ message: 'Filename is required' });
  }

  const cleanFilename = path.basename(filename);
  const filePath = path.join(process.cwd(), 'public', 'uploads', 'resumes', cleanFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      message: 'Resume document not found on server.',
      filename: cleanFilename,
    });
  }

  const ext = path.extname(cleanFilename).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.pdf') {
    contentType = 'application/pdf';
  } else if (ext === '.png') {
    contentType = 'image/png';
  } else if (ext === '.jpg' || ext === '.jpeg') {
    contentType = 'image/jpeg';
  } else if (ext === '.doc') {
    contentType = 'application/msword';
  } else if (ext === '.docx') {
    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${cleanFilename}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(fileBuffer);
  } catch (error) {
    console.error('Error reading resume document:', error);
    return res.status(500).json({ message: 'Error retrieving document from storage' });
  }
}

