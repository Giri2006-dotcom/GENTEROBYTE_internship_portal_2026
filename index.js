require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');

const app = express();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  throw new Error('Missing CLIENT_ID, CLIENT_SECRET, or REDIRECT_URI in .env');
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ['https://mail.google.com/'];

app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log('=== OAuth2 Tokens ===');
    console.log('Refresh Token:', tokens.refresh_token);
    console.log('Access Token:', tokens.access_token);
    console.log('Expiry Date:', tokens.expiry_date);
    console.log('====================');

    res.send(`Authorization complete. Refresh token has been logged to the server console.`);
  } catch (error) {
    console.error('Error exchanging authorization code:', error);
    res.status(500).send('Failed to exchange authorization code for tokens');
  }
});

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
  console.log('Open http://localhost:3000/auth to start the Google OAuth2 flow');
});
