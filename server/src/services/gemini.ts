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
): Promise<ParsedFoodResult[]> {
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
1. Understand all foods, quantities, and preparations mentioned (e.g. raw, dry, cooked, boiled, curry).
2. MULTI-FOOD DETECTION:
   - If the user entered multiple foods (e.g. "100g cooked rice and 150g chole", "2 eggs and 1 slice toast", "chicken breast, rice and broccoli"), identify EACH separate food item as an individual object in a JSON array.
   - If only one food item is mentioned (e.g. "100g rice"), return a JSON array with just that single object.
3. TYPO & UNIT CORRECTIONS for personal meal tracking:
   - Normal human meal portions are strictly within plausible dietary ranges (typically 10g to 1000g).
   - If a user enters '100kg', '100k', '100h', '100j', '100gm', or '100' for a food, interpret such personal meal entries as GRAMS (e.g. 100g).
   - If no unit is specified (e.g. "100 rice" or "150 chole"), interpret the number as grams.
4. Calculate the accurate nutritional breakdown for EACH food item:
   - calories (kcal in rounded integer)
   - carbohydrates (carbs in grams, rounded to 1 decimal place)
   - fat (fat in grams, rounded to 1 decimal place)
   - dietary fibre (fibre in grams, rounded to 1 decimal place)
   - protein (protein in grams, rounded to 1 decimal place)
   based on scientific food databases (like USDA FoodData Central / IFCT).
5. Also compute the base per 100 grams breakdown for each item.

Return ONLY a raw JSON array (without markdown code blocks, backticks, or extra commentary) adhering strictly to this JSON format:
[
  {
    "name": "Full capitalized food name, e.g. Cooked Rice",
    "weight": number (grams, e.g. 100),
    "kcal": number (rounded integer, e.g. 130),
    "carbs": number (grams, e.g. 28.0),
    "fat": number (grams, e.g. 0.3),
    "fibre": number (grams, e.g. 0.4),
    "protein": number (grams, e.g. 2.7),
    "per100g": {
      "kcal": number,
      "carbs": number,
      "fat": number,
      "fibre": number,
      "protein": number
    }
  }
]`;

  const CANDIDATE_MODELS = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-flash-lite-latest',
    'gemini-3.6-flash',
    'gemini-2.5-flash',
  ];

  let responseText: string | null = null;
  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim();
      if (text) {
        responseText = text;
        console.log(`[Gemini AI] Model ${modelName} succeeded.`);
        break;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini AI] Model ${modelName} unavailable (${err.message?.slice(0, 100)}...). Falling back to next model...`);
    }
  }

  if (!responseText) {
    throw new Error(
      lastError?.message ||
        'All available Gemini models reached temporary quota limits. Please retry in a few moments.'
    );
  }

  try {
    const cleanedText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const data = JSON.parse(cleanedText);

    console.log(`[Gemini AI] Received response:`, data);

    let rawItems: any[] = [];
    if (Array.isArray(data)) {
      rawItems = data;
    } else if (Array.isArray(data.items)) {
      rawItems = data.items;
    } else if (Array.isArray(data.foods)) {
      rawItems = data.foods;
    } else if (typeof data === 'object' && data !== null) {
      rawItems = [data];
    }

    if (rawItems.length === 0) {
      throw new Error('No nutrient data could be determined for the entered food.');
    }

    const parsedItems: ParsedFoodResult[] = rawItems.map((item) => {
      let weight = Number(item.weight) || 100;
      let kcal = Math.round(Number(item.kcal) || 0);
      let carbs = Math.round((Number(item.carbs) || 0) * 10) / 10;
      let fat = Math.round((Number(item.fat) || 0) * 10) / 10;
      let fibre = Math.round((Number(item.fibre) || 0) * 10) / 10;
      let protein = Math.round((Number(item.protein) || 0) * 10) / 10;

      // Safety guard: if weight was returned >= 5000g due to a "kg" typo for a single meal portion
      if (weight >= 5000 && (weight % 1000 === 0)) {
        const scaleDown = 1000;
        weight = weight / scaleDown;
        kcal = Math.round(kcal / scaleDown);
        carbs = Math.round((carbs / scaleDown) * 10) / 10;
        fat = Math.round((fat / scaleDown) * 10) / 10;
        fibre = Math.round((fibre / scaleDown) * 10) / 10;
        protein = Math.round((protein / scaleDown) * 10) / 10;
      }

      const ratio = weight > 0 ? weight / 100 : 1;
      const per100g = item.per100g || {
        kcal: Math.round(kcal / ratio),
        carbs: Math.round((carbs / ratio) * 10) / 10,
        fat: Math.round((fat / ratio) * 10) / 10,
        fibre: Math.round((fibre / ratio) * 10) / 10,
        protein: Math.round((protein / ratio) * 10) / 10,
      };

      return {
        name: item.name || query,
        weight,
        kcal,
        carbs,
        fat,
        fibre,
        protein,
        per100g,
        rawQuery: query,
      };
    });

    return parsedItems;
  } catch (err: any) {
    console.error('[Gemini AI] Error parsing response:', err?.message || err);
    throw new Error(err?.message || 'Failed to calculate nutrients with Gemini API.');
  }
}
