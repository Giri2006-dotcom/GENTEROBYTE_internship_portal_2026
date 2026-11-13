import type { NextApiRequest, NextApiResponse } from 'next';
import { getApplicationById } from '../../../../lib/applicationStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Application ID is required' });
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString() })}\n\n`);

  let lastStatus = '';
  let isActive = true;

  // Poll store every 3 seconds and stream changes to client
  const interval = setInterval(async () => {
    if (!isActive) return;

    try {
      const app = await getApplicationById(id);
      if (app) {
        if (!lastStatus || lastStatus !== app.status) {
          lastStatus = app.status;
          res.write(
            `data: ${JSON.stringify({
              type: 'status_update',
              applicationId: app.applicationId,
              status: app.status,
              updatedAt: app.updatedAt,
              reviewerNotes: app.reviewerNotes,
            })}\n\n`
          );
        } else {
          // Heartbeat ping
          res.write(`data: ${JSON.stringify({ type: 'heartbeat', time: Date.now() })}\n\n`);
        }
      }
    } catch {
      // Ignore read errors during interval
    }
  }, 3000);

  req.on('close', () => {
    isActive = false;
    clearInterval(interval);
    res.end();
  });
}
