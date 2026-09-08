import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { authRouter } from './routes/auth.js';
import { logsRouter } from './routes/logs.js';
import { nutritionRouter } from './routes/nutrition.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/logs', logsRouter);
app.use('/api/nutrition', nutritionRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'DailyLog API',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Connect to MongoDB and start server
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[DailyLog Server] Running at http://localhost:${PORT}`);
    console.log(`[DailyLog Server] API Health: http://localhost:${PORT}/api/health`);
  });
}

startServer();
