import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { parseWithGemini } from '../services/gemini.js';
import { User } from '../models/User.js';

export const nutritionRouter = Router();

nutritionRouter.post('/parse', async (req: Request, res: Response) => {
  try {
    const { query, userId, apiKey } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter what you ate.' });
    }

    let activeKey = apiKey;
    if (!activeKey && userId && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);
      if (user?.geminiApiKey) {
        activeKey = user.geminiApiKey;
      }
    }

    const results = await parseWithGemini(query, activeKey);

    res.json({
      success: true,
      results,
      result: results[0],
    });
  } catch (error: any) {
    console.error('[Nutrition Route] Error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to calculate nutrition via Gemini API',
    });
  }
});
