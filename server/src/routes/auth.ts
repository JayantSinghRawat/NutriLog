import { Router, Request, Response } from 'express';
import { User } from '../models/User.js';

export const authRouter = Router();

// Login or auto-create account
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    const cleanEmail = (email || 'jayant@example.com').toLowerCase().trim();
    const cleanName = name || cleanEmail.split('@')[0] || 'Jayant';

    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      user = await User.create({
        email: cleanEmail,
        name: cleanName,
        dailyGoals: {
          kcal: 2200,
          protein: 150,
          carbs: 220,
          fat: 65,
          fibre: 32,
        },
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        dailyGoals: user.dailyGoals,
        hasGeminiKey: Boolean(user.geminiApiKey || process.env.GEMINI_API_KEY),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update daily macro targets
authRouter.put('/goals', async (req: Request, res: Response) => {
  try {
    const { userId, dailyGoals } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { dailyGoals } },
      { new: true }
    );

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save user's Gemini API key
authRouter.put('/gemini-key', async (req: Request, res: Response) => {
  try {
    const { userId, geminiApiKey } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    await User.findByIdAndUpdate(userId, { $set: { geminiApiKey } });

    res.json({ success: true, message: 'Gemini API key saved successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
