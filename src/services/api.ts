import { FoodEntry, NutrientTotals, DailyGoals, UserSession, HistorySummaryItem } from '../types/nutrition.js';

const API_BASE = '/api';

export async function loginUser(email: string, password?: string): Promise<UserSession> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Login failed. Please check your credentials.');
  }
  return data.user;
}

export async function registerUser(email: string, name: string, password?: string): Promise<UserSession> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Account registration failed.');
  }
  return data.user;
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
): Promise<FoodEntry> {
  const res = await fetch(`${API_BASE}/nutrition/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, userId, apiKey: geminiApiKey }),
  });
  
  const data = await res.json();
  if (!res.ok || !data.success || !data.result) {
    throw new Error(data.message || 'Failed to parse nutrition with Gemini API');
  }

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
    source: 'gemini',
  };
}
