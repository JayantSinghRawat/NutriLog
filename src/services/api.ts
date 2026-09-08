import { FoodEntry, NutrientTotals, DailyGoals, UserSession, HistorySummaryItem } from '../types/nutrition.js';

const API_BASE = '/api';

export async function loginUser(email?: string, name?: string): Promise<UserSession> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    const data = await res.json();
    if (data.success) {
      return data.user;
    }
  } catch (e) {
    console.warn('[API] Backend login failed, using local session:', e);
  }

  // Fallback to local default session
  return {
    id: 'user_local_' + (email ? email.replace(/[^a-zA-Z0-9]/g, '') : 'default'),
    email: email || 'jayant@example.com',
    name: name || 'Jayant',
    dailyGoals: {
      kcal: 2200,
      protein: 150,
      carbs: 220,
      fat: 65,
      fibre: 32,
    },
  };
}

export async function updateUserGoals(userId: string, dailyGoals: DailyGoals): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/goals`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, dailyGoals }),
    });
  } catch (e) {
    console.warn('[API] Could not update goals in backend:', e);
  }
}

export async function saveUserGeminiKey(userId: string, geminiApiKey: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/gemini-key`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, geminiApiKey }),
    });
  } catch (e) {
    console.warn('[API] Could not save Gemini key to backend:', e);
  }
}

export async function fetchDailyLog(
  userId: string,
  date: string
): Promise<{ entries: FoodEntry[]; totals: NutrientTotals }> {
  try {
    const res = await fetch(`${API_BASE}/logs/${date}?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (data.success) {
      return {
        entries: data.entries || [],
        totals: data.totals || { weight: 0, kcal: 0, carbs: 0, fat: 0, fibre: 0, protein: 0 },
      };
    }
  } catch (e) {
    console.warn('[API] Could not fetch log from backend, checking localStorage:', e);
  }

  // Local storage fallback
  try {
    const raw = localStorage.getItem(`dailylog_entries_${userId}_${date}`);
    if (raw) {
      const entries: FoodEntry[] = JSON.parse(raw);
      const totals = entries.reduce(
        (acc, item) => ({
          weight: acc.weight + (Number(item.weight) || 0),
          kcal: acc.kcal + (Number(item.kcal) || 0),
          carbs: acc.carbs + (Number(item.carbs) || 0),
          fat: acc.fat + (Number(item.fat) || 0),
          fibre: acc.fibre + (Number(item.fibre) || 0),
          protein: acc.protein + (Number(item.protein) || 0),
        }),
        { weight: 0, kcal: 0, carbs: 0, fat: 0, fibre: 0, protein: 0 }
      );
      return { entries, totals };
    }
  } catch (err) {}

  return {
    entries: [],
    totals: { weight: 0, kcal: 0, carbs: 0, fat: 0, fibre: 0, protein: 0 },
  };
}

export async function saveDailyLogToDb(
  userId: string,
  date: string,
  entries: FoodEntry[]
): Promise<NutrientTotals> {
  // Always mirror in localStorage for instant offline access
  try {
    localStorage.setItem(`dailylog_entries_${userId}_${date}`, JSON.stringify(entries));
  } catch (e) {}

  try {
    const res = await fetch(`${API_BASE}/logs/${date}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, entries }),
    });
    const data = await res.json();
    if (data.success && data.totals) {
      return data.totals;
    }
  } catch (e) {
    console.warn('[API] Failed to save log to MongoDB backend:', e);
  }

  // Calculate totals locally if backend not reachable
  return entries.reduce(
    (acc, item) => ({
      weight: acc.weight + (Number(item.weight) || 0),
      kcal: acc.kcal + (Number(item.kcal) || 0),
      carbs: acc.carbs + (Number(item.carbs) || 0),
      fat: acc.fat + (Number(item.fat) || 0),
      fibre: acc.fibre + (Number(item.fibre) || 0),
      protein: acc.protein + (Number(item.protein) || 0),
    }),
    { weight: 0, kcal: 0, carbs: 0, fat: 0, fibre: 0, protein: 0 }
  );
}

export async function fetchHistorySummary(userId: string): Promise<HistorySummaryItem[]> {
  try {
    const res = await fetch(`${API_BASE}/logs/history/summary?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (data.success && data.history) {
      return data.history;
    }
  } catch (e) {
    console.warn('[API] Could not fetch history summary:', e);
  }
  return [];
}

export async function parseFoodQueryApi(
  query: string,
  userId?: string,
  geminiApiKey?: string
): Promise<FoodEntry | null> {
  try {
    const res = await fetch(`${API_BASE}/nutrition/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, userId, apiKey: geminiApiKey }),
    });
    const data = await res.json();
    if (data.success && data.result) {
      return {
        id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        name: data.result.name,
        weight: data.result.weight,
        kcal: data.result.kcal,
        carbs: data.result.carbs,
        fat: data.result.fat,
        fibre: data.result.fibre,
        protein: data.result.protein,
        per100g: data.result.per100g,
        rawQuery: data.result.rawQuery,
      };
    }
  } catch (e) {
    console.warn('[API] Parse request failed, falling back to local engine:', e);
  }

  // Dynamic import of local fallback parser if needed
  try {
    const { parseFoodQuery } = await import('../utils/nutritionParser.js');
    const local = parseFoodQuery(query);
    if (local) {
      return local;
    }
  } catch (e) {
    console.error('Local fallback parser error:', e);
  }

  return null;
}
