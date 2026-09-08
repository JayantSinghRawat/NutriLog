import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

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
}

/**
 * Dynamically retrieves the Gemini API key from .env or process.env
 */
export function getActiveGeminiKey(userApiKey?: string): string {
  if (userApiKey && userApiKey.trim()) {
    return userApiKey.trim();
  }

  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^GEMINI_API_KEY\s*=\s*(.*)$/m);
      if (match && match[1]) {
        const parsedKey = match[1].trim().replace(/^["']|["']$/g, '');
        if (parsedKey) {
          process.env.GEMINI_API_KEY = parsedKey;
          return parsedKey;
        }
      }
    }
  } catch (e) {
    console.warn('[Gemini AI] Error reading .env file:', e);
  }

  return process.env.GEMINI_API_KEY?.trim() || '';
}

/**
 * Direct Gemini API nutrient calculation - ZERO hardcoded data.
 */
export async function parseWithGemini(
  query: string,
  userApiKey?: string
): Promise<ParsedFoodResult> {
  const apiKey = getActiveGeminiKey(userApiKey);

  if (!apiKey) {
    throw new Error(
      'Gemini API key is missing. Please save your API key in .env (GEMINI_API_KEY=...) and press Cmd+S to save the file!'
    );
  }

  console.log(`[Gemini AI] Querying Google Gemini API for: "${query}"...`);

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a certified clinical nutrition and food science database engine.
The user entered what they ate in their personal daily meal tracker: "${query}"

Critical Dietary Tracking Instructions:
1. Understand the food, quantity, and preparation (e.g. raw, dry, cooked, boiled).
2. TYPO & UNIT CORRECTIONS for personal meal tracking:
   - Users log individual meals. Normal human meal portions are strictly within plausible dietary ranges (typically 10g to 1000g).
   - If a user enters '100kg', '100k', '100h', '100j', '100gm', or '100' for a food like soya chunks, chicken, rice, paneer, etc., they made a mobile keyboard typo (h, j, k are adjacent to g on keyboards) or mistakenly typed 'kg' instead of grams.
   - ALWAYS interpret such personal meal entries as GRAMS (e.g. '100kg soya chunks' or '100k soya chunks' means 100 grams, NOT 100,000 grams!).
   - Never output an absurd single-meal weight like 100,000g. For personal meal food logs, normalize bulk typos to the intended gram meal portion (e.g. 100g).
   - If no unit is specified (e.g. "100 soya chunks" or "150 chicken"), interpret the number as grams ('100g', '150g') or serving count where appropriate.
3. Calculate the accurate nutritional breakdown:
   - calories (kcal in rounded integer, e.g. 345)
   - carbohydrates (carbs in grams, rounded to 1 decimal place, e.g. 33.6)
   - fat (fat in grams, rounded to 1 decimal place, e.g. 0.8)
   - dietary fibre (fibre in grams, rounded to 1 decimal place, e.g. 14.0)
   - protein (protein in grams, rounded to 1 decimal place, e.g. 52.0)
   based on scientific food databases (like USDA FoodData Central / IFCT).
4. Also compute the base per 100 grams breakdown so the user can rescale the portion later if needed.

Return ONLY a raw JSON object (without markdown code blocks, backticks, or extra commentary) adhering strictly to this JSON format:
{
  "name": "Full capitalized food name including state, e.g. Soya Chunks (Dry)",
  "weight": number (grams, e.g. 100),
  "kcal": number (rounded integer, e.g. 345),
  "carbs": number (grams, rounded to 1 decimal place, e.g. 33.6),
  "fat": number (grams, rounded to 1 decimal place, e.g. 0.8),
  "fibre": number (grams, rounded to 1 decimal place, e.g. 14.0),
  "protein": number (grams, rounded to 1 decimal place, e.g. 52.0),
  "per100g": {
    "kcal": number,
    "carbs": number,
    "fat": number,
    "fibre": number,
    "protein": number
  }
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    const cleanedText = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const data = JSON.parse(cleanedText);

    console.log(`[Gemini AI] Received response:`, data);

    let weight = Number(data.weight) || 100;
    let kcal = Math.round(Number(data.kcal) || 0);
    let carbs = Math.round((Number(data.carbs) || 0) * 10) / 10;
    let fat = Math.round((Number(data.fat) || 0) * 10) / 10;
    let fibre = Math.round((Number(data.fibre) || 0) * 10) / 10;
    let protein = Math.round((Number(data.protein) || 0) * 10) / 10;

    // Safety guard: if weight was returned >= 3000g due to a "kg" typo for a single meal portion
    if (weight >= 5000 && (weight % 1000 === 0)) {
      const scaleDown = 1000;
      weight = weight / scaleDown;
      kcal = Math.round(kcal / scaleDown);
      carbs = Math.round((carbs / scaleDown) * 10) / 10;
      fat = Math.round((fat / scaleDown) * 10) / 10;
      fibre = Math.round((fibre / scaleDown) * 10) / 10;
      protein = Math.round((protein / scaleDown) * 10) / 10;
    }

    const per100g = data.per100g || {
      kcal: Math.round(kcal / (weight / 100)),
      carbs: Math.round((carbs / (weight / 100)) * 10) / 10,
      fat: Math.round((fat / (weight / 100)) * 10) / 10,
      fibre: Math.round((fibre / (weight / 100)) * 10) / 10,
      protein: Math.round((protein / (weight / 100)) * 10) / 10,
    };

    return {
      name: data.name || query,
      weight,
      kcal,
      carbs,
      fat,
      fibre,
      protein,
      per100g,
      rawQuery: query,
    };
  } catch (err: any) {
    console.error('[Gemini AI] Error calling Gemini:', err?.message || err);
    throw new Error(err?.message || 'Failed to calculate nutrients with Gemini API.');
  }
}
