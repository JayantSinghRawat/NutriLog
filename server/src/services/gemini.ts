import { GoogleGenAI } from '@google/genai';

export interface ParsedFoodResult {
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
  rawQuery: string;
  source: 'gemini' | 'fallback';
}

// Built-in verified database fallback in case Gemini API key is not yet set
const FALLBACK_DATABASE: Record<string, { name: string; per100g: any; defaultWeight?: number }> = {
  'soya chunks dry': { name: 'Soya Chunks (Dry)', per100g: { kcal: 345, carbs: 33, fat: 0.5, fibre: 13, protein: 52 } },
  'soya chunks': { name: 'Soya Chunks (Dry)', per100g: { kcal: 345, carbs: 33, fat: 0.5, fibre: 13, protein: 52 } },
  'chicken breast': { name: 'Chicken Breast (Cooked/Grilled)', per100g: { kcal: 165, carbs: 0, fat: 3.6, fibre: 0, protein: 31 } },
  'egg': { name: 'Egg (Whole)', per100g: { kcal: 143, carbs: 0.7, fat: 9.5, fibre: 0, protein: 12.6 }, defaultWeight: 50 },
  'eggs': { name: 'Egg (Whole)', per100g: { kcal: 143, carbs: 0.7, fat: 9.5, fibre: 0, protein: 12.6 }, defaultWeight: 50 },
  'egg white': { name: 'Egg White', per100g: { kcal: 52, carbs: 0.7, fat: 0.2, fibre: 0, protein: 11 }, defaultWeight: 33 },
  'paneer': { name: 'Paneer (Cottage Cheese)', per100g: { kcal: 296, carbs: 4.5, fat: 22, fibre: 0, protein: 18.3 } },
  'whey': { name: 'Whey Protein Powder', per100g: { kcal: 390, carbs: 7.5, fat: 4.5, fibre: 1, protein: 78 }, defaultWeight: 33 },
  'roti': { name: 'Roti / Chapati', per100g: { kcal: 297, carbs: 56, fat: 3, fibre: 10, protein: 11 }, defaultWeight: 35 },
  'rice': { name: 'White Rice (Cooked)', per100g: { kcal: 130, carbs: 28.2, fat: 0.3, fibre: 0.4, protein: 2.7 } },
  'oats': { name: 'Oats (Rolled/Raw)', per100g: { kcal: 389, carbs: 66.3, fat: 6.9, fibre: 10.6, protein: 16.9 } },
  'peanut butter': { name: 'Peanut Butter', per100g: { kcal: 588, carbs: 20, fat: 50, fibre: 6, protein: 25 }, defaultWeight: 32 },
  'milk': { name: 'Cow Milk (Toned)', per100g: { kcal: 58, carbs: 4.8, fat: 3.0, fibre: 0, protein: 3.2 } },
  'curd': { name: 'Curd / Dahi', per100g: { kcal: 61, carbs: 4.7, fat: 3.3, fibre: 0, protein: 3.5 } },
  'banana': { name: 'Banana', per100g: { kcal: 89, carbs: 22.8, fat: 0.3, fibre: 2.6, protein: 1.1 }, defaultWeight: 120 },
  'apple': { name: 'Apple', per100g: { kcal: 52, carbs: 13.8, fat: 0.2, fibre: 2.4, protein: 0.3 }, defaultWeight: 150 },
  'sweet potato': { name: 'Sweet Potato (Boiled)', per100g: { kcal: 86, carbs: 20.1, fat: 0.1, fibre: 3.0, protein: 1.6 } },
};

export function fallbackParse(rawQuery: string): ParsedFoodResult {
  const clean = rawQuery.trim();
  // Match start: e.g. "10h soya chunks dry" or "2 eggs" or "100g chicken breast"
  const startMatch = clean.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s+(.+)$/i);
  let qty = 100;
  let unit = 'g';
  let foodName = clean.toLowerCase();

  if (startMatch) {
    qty = parseFloat(startMatch[1]);
    unit = (startMatch[2] || 'g').toLowerCase();
    foodName = startMatch[3].trim().toLowerCase();
  } else {
    const endMatch = clean.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/i);
    if (endMatch) {
      foodName = endMatch[1].trim().toLowerCase();
      qty = parseFloat(endMatch[2]);
      unit = (endMatch[3] || 'g').toLowerCase();
    }
  }

  // Common typo correction: 'h' next to 'g' on keyboard
  if (unit === 'h') unit = 'g';

  let matched = null;
  for (const [key, item] of Object.entries(FALLBACK_DATABASE)) {
    if (foodName.includes(key) || key.includes(foodName)) {
      matched = item;
      break;
    }
  }

  let weight = qty;
  if (matched?.defaultWeight && unit !== 'g' && unit !== 'gm' && unit !== 'gram') {
    weight = qty * matched.defaultWeight;
  }
  if (unit === 'kg') weight = qty * 1000;

  const per100g = matched?.per100g || {
    kcal: 150,
    carbs: 15,
    fat: 5,
    fibre: 1,
    protein: 10,
  };

  const factor = weight / 100;
  return {
    name: matched?.name || clean.charAt(0).toUpperCase() + clean.slice(1),
    weight: Math.round(weight * 10) / 10,
    kcal: Math.round(per100g.kcal * factor),
    carbs: Math.round(per100g.carbs * factor * 10) / 10,
    fat: Math.round(per100g.fat * factor * 10) / 10,
    fibre: Math.round(per100g.fibre * factor * 10) / 10,
    protein: Math.round(per100g.protein * factor * 10) / 10,
    per100g,
    rawQuery,
    source: 'fallback',
  };
}

export async function parseWithGemini(
  query: string,
  userApiKey?: string
): Promise<ParsedFoodResult> {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.log('[Nutrition] No Gemini API key provided. Using built-in database parser.');
    return fallbackParse(query);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

    const prompt = `You are an expert nutrition and macro calculator.
Analyze the user's food log query: "${query}"

Instructions:
1. Detect quantity, unit, and food item. Note that typos like '10h' means '10g' ('h' is next to 'g' on keyboard).
2. Compute the exact weight in grams.
3. Compute the macronutrients (kcal, carbs in g, fat in g, fibre in g, protein in g) based on scientific food composition tables.
4. Also provide the base per100g values so the user can scale weight later.

Return ONLY a valid JSON object matching this exact TypeScript structure, with no markdown code fences:
{
  "name": "Standard capitalized food name with state, e.g. Soya Chunks (Dry)",
  "weight": number (grams),
  "kcal": number (rounded integer),
  "carbs": number (grams, up to 1 decimal place),
  "fat": number (grams, up to 1 decimal place),
  "fibre": number (grams, up to 1 decimal place),
  "protein": number (grams, up to 1 decimal place),
  "per100g": {
    "kcal": number,
    "carbs": number,
    "fat": number,
    "fibre": number,
    "protein": number
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    // Clean any potential markdown wrapping
    const cleanedText = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const data = JSON.parse(cleanedText);

    return {
      name: data.name || query,
      weight: Number(data.weight) || 100,
      kcal: Math.round(Number(data.kcal) || 0),
      carbs: Math.round((Number(data.carbs) || 0) * 10) / 10,
      fat: Math.round((Number(data.fat) || 0) * 10) / 10,
      fibre: Math.round((Number(data.fibre) || 0) * 10) / 10,
      protein: Math.round((Number(data.protein) || 0) * 10) / 10,
      per100g: data.per100g || {
        kcal: Math.round((Number(data.kcal) || 0) / ((Number(data.weight) || 100) / 100)),
        carbs: Number(data.carbs) || 0,
        fat: Number(data.fat) || 0,
        fibre: Number(data.fibre) || 0,
        protein: Number(data.protein) || 0,
      },
      rawQuery: query,
      source: 'gemini',
    };
  } catch (error: any) {
    console.error('[Gemini AI] Error parsing with Gemini:', error?.message || error);
    console.log('[Gemini AI] Falling back to built-in verified nutrition engine.');
    return fallbackParse(query);
  }
}
