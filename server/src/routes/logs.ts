import { Router, Request, Response } from 'express';
import { DailyLog, IFoodEntry, INutrientTotals } from '../models/DailyLog.js';

export const logsRouter = Router();

function computeTotals(entries: IFoodEntry[] = []): INutrientTotals {
  return entries.reduce(
    (acc, item) => {
      acc.weight += Number(item.weight) || 0;
      acc.kcal += Number(item.kcal) || 0;
      acc.carbs += Number(item.carbs) || 0;
      acc.fat += Number(item.fat) || 0;
      acc.fibre += Number(item.fibre) || 0;
      acc.protein += Number(item.protein) || 0;
      return acc;
    },
    { weight: 0, kcal: 0, carbs: 0, fat: 0, fibre: 0, protein: 0 }
  );
}

// Get daily log for a specific date (YYYY-MM-DD)
logsRouter.get('/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const userId = (req.query.userId as string) || 'default_user';

    let log = await DailyLog.findOne({ userId, date });
    if (!log) {
      return res.json({
        success: true,
        date,
        entries: [],
        totals: { weight: 0, kcal: 0, carbs: 0, fat: 0, fibre: 0, protein: 0 },
      });
    }

    res.json({
      success: true,
      date: log.date,
      entries: log.entries,
      totals: log.totals,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update or create daily log for a date
logsRouter.put('/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const { userId, entries } = req.body;
    const cleanUserId = userId || 'default_user';

    const cleanEntries: IFoodEntry[] = (entries || []).map((e: any) => ({
      id: e.id || 'e_' + Math.random().toString(36).substr(2, 9),
      name: e.name || 'Food Item',
      weight: Number(e.weight) || 0,
      kcal: Math.round(Number(e.kcal) || 0),
      carbs: Math.round((Number(e.carbs) || 0) * 10) / 10,
      fat: Math.round((Number(e.fat) || 0) * 10) / 10,
      fibre: Math.round((Number(e.fibre) || 0) * 10) / 10,
      protein: Math.round((Number(e.protein) || 0) * 10) / 10,
      per100g: e.per100g,
      rawQuery: e.rawQuery,
      isCustom: e.isCustom,
    }));

    const totals = computeTotals(cleanEntries);

    const log = await DailyLog.findOneAndUpdate(
      { userId: cleanUserId, date },
      {
        $set: {
          entries: cleanEntries,
          totals,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      log,
      totals,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get historical summary of all logged past days
logsRouter.get('/history/summary', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'default_user';

    const logs = await DailyLog.find({ userId })
      .select('date totals entries updatedAt')
      .sort({ date: -1 })
      .limit(60);

    const summary = logs.map((l) => ({
      date: l.date,
      itemCount: l.entries.length,
      totals: l.totals,
      updatedAt: l.updatedAt,
    }));

    res.json({
      success: true,
      history: summary,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
