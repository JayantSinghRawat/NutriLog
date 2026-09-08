import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { authRouter } from './routes/auth.js';
import { logsRouter } from './routes/logs.js';
import { nutritionRouter } from './routes/nutrition.js';
import { getActiveGeminiKey } from './services/gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../dist');

const app = express();
const PORT = process.env.PORT || 5050;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/logs', logsRouter);
app.use('/api/nutrition', nutritionRouter);

// Health check endpoints (lightweight for cron pingers)
app.get('/health', (req, res) => res.status(200).send('OK'));

app.get('/api/health', (req, res) => {
  const activeKey = getActiveGeminiKey();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'NutriLog API',
    hasGeminiKey: Boolean(activeKey),
    keyMasked: activeKey ? `${activeKey.slice(0, 6)}...${activeKey.slice(-4)}` : null,
  });
});

/**
 * Built-in Keep-Alive Self-Pinger for Render Free Tier.
 * Render Web Services spin down after 15 minutes of inactivity.
 * This background task automatically pings the public URL every 10 minutes to guarantee 24/7 uptime.
 */
function initKeepAlivePinger() {
  const targetUrl =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.SELF_PING_URL ||
    process.env.SERVER_URL ||
    process.env.API_URL;

  if (!targetUrl) {
    console.log('[Keep-Alive] No external URL detected (local development). Self-ping idle.');
    return;
  }

  const cleanBase = targetUrl.replace(/\/$/, '');
  const pingUrl = `${cleanBase}/health`;
  const PING_INTERVAL_MS = 10 * 60 * 1000; // Ping every 10 minutes (Render sleeps at 15m)

  console.log(`[Keep-Alive] 🚀 Active: Self-pinging ${pingUrl} every 10 minutes to keep Render awake 24/7`);

  const doPing = async () => {
    try {
      const res = await fetch(pingUrl, {
        headers: { 'User-Agent': 'NutriLog-KeepAlive-SelfPing/1.0' },
      });
      console.log(`[Keep-Alive] Pinged ${pingUrl} -> Status: ${res.status} at ${new Date().toISOString()}`);
    } catch (err: any) {
      console.warn(`[Keep-Alive] Ping warning:`, err.message);
    }
  };

  // Initial ping 30 seconds after server starts
  setTimeout(doPing, 30 * 1000);

  // Recurring ping every 10 minutes
  setInterval(doPing, PING_INTERVAL_MS);
}

// Serve frontend static build in production (if built)
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback middleware (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Connect to MongoDB and start server
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[NutriLog Server] Running at http://localhost:${PORT}`);
    console.log(`[NutriLog Server] API Health: http://localhost:${PORT}/api/health`);
    initKeepAlivePinger();
  });
}

startServer();
