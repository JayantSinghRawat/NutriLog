import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

export const authRouter = Router();

// Register new user account
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || cleanEmail.split('@')[0] || 'User').trim();
    const cleanPassword = (password || 'password123').trim();

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.',
      });
    }

    const user = await User.create({
      email: cleanEmail,
      name: cleanName,
      password: cleanPassword,
      dailyGoals: {
        kcal: 2200,
        protein: 150,
        carbs: 220,
        fat: 65,
        fibre: 32,
      },
    });

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

// Login existing user
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = (password || '').trim();

    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email. Please create an account.',
      });
    }

    // Verify password if set on user
    if (user.password && cleanPassword && user.password !== cleanPassword) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please check your credentials.',
      });
    }

    // If user didn't have password set previously, set it now
    if (!user.password && cleanPassword) {
      user.password = cleanPassword;
      await user.save();
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
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ success: true, user: null });
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
