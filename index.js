'use strict';
const fs      = require('fs');
const path    = require('path');
const express = require('express');
const config  = require('./config/config');
const logger  = require('./utils/logger');

logger.banner();

const dirs = ['./sessions', './database', './assets', './logs'];
dirs.forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });

process.on('uncaughtException',  (err) => logger.error('Uncaught Exception:', err.message));
process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection:', reason?.message || reason));

const { restoreAllSessions } = require('./core/whatsapp');
(async () => {
  try { await restoreAllSessions(null); logger.success('Sessions restored.'); }
  catch (err) { logger.error('Session restore error:', err.message); }
})();

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('/ping', (req, res) => res.send('pong'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/pair', async (req, res) => {
  try {
    const number = (req.query.number || req.query.phone || '').replace(/[^0-9]/g, '');
    if (!number || number.length < 10) return res.json({ error: 'Valid number required' });
    const { generatePairCode } = require('./core/webPair');
    const code = await generatePairCode(number);
    res.json({ code });
  } catch (err) { res.json({ error: err.message }); }
});

app.get('/session', (req, res) => {
  const number = (req.query.number || '').replace(/[^0-9]/g, '');
  const sessionManager = require('./core/session');
  res.json(sessionManager.exists(number) ? { connected: true, number } : { connected: false });
});

app.listen(config.port, () => logger.success(`Bot running on port ${config.port}`));
process.on('SIGINT',  () => { logger.warn('Shutting down...'); process.exit(0); });
process.on('SIGTERM', () => { logger.warn('Shutting down...'); process.exit(0); });
