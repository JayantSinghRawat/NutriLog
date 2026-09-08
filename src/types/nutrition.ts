export interface FoodEntry {
  id: string;
  name: string;
  weight: number;
  kcal: number;
  carbs: number;
  fat: number;
  fibre: number;
  protein: number;
  per100g?: {
    kcal: number;
    carbs: number;
    fat: number;
    fibre: number;
    protein: number;
  };
  rawQuery?: string;
  isCustom?: boolean;
  source?: 'gemini' | 'fallback';
}

export interface NutrientTotals {
  weight: number;
  kcal: number;
  carbs: number;
  fat: number;
  fibre: number;
  protein: number;
}

export interface DailyGoals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  dailyGoals: DailyGoals;
  hasGeminiKey?: boolean;
  geminiApiKey?: string;
}

export interface HistorySummaryItem {
  date: string;
  itemCount: number;
  totals: NutrientTotals;
  updatedAt: string;
}
