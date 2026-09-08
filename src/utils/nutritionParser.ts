import { getAllFoods, FoodDatabaseItem } from '../data/foodDatabase.js';
import { FoodEntry } from '../types/nutrition.js';

function normalizeUnit(rawUnit: string, foodDefaultUnit: string = 'g'): string {
  if (!rawUnit) return foodDefaultUnit;
  const u = rawUnit.toLowerCase().trim();

  // Typo: 'h' next to 'g' on keyboard
  if (u === 'h' || u === 'g' || u === 'gm' || u === 'gms' || u === 'gram' || u === 'grams') {
    return 'g';
  }
  if (u === 'kg' || u === 'kgs' || u === 'kilo' || u === 'kilogram') {
    return 'kg';
  }
  if (u === 'ml' || u === 'l' || u === 'ltr' || u === 'liter' || u === 'litre') {
    return u === 'l' || u === 'ltr' || u === 'liter' || u === 'litre' ? 'l' : 'ml';
  }
  if (u === 'pc' || u === 'pcs' || u === 'piece' || u === 'pieces' || u === 'no' || u === 'nos') {
    return 'pcs';
  }
  if (u === 'scoop' || u === 'scoops') {
    return 'scoop';
  }
  if (u === 'roti' || u === 'rotis' || u === 'chapati' || u === 'chapatis') {
    return 'pcs';
  }
  if (u === 'egg' || u === 'eggs') {
    return 'pcs';
  }
  if (u === 'slice' || u === 'slices') {
    return 'slice';
  }
  if (u === 'tbsp' || u === 'tablespoon' || u === 'tablespoons') {
    return 'tbsp';
  }
  if (u === 'tsp' || u === 'teaspoon' || u === 'teaspoons') {
    return 'tsp';
  }
  if (u === 'cup' || u === 'cups' || u === 'katori' || u === 'bowl' || u === 'bowls') {
    return 'cup';
  }

  return rawUnit;
}

export function calculateGrams(quantity: number, unit: string, food: FoodDatabaseItem | null): number {
  const qty = quantity || 100;
  const normalizedU = normalizeUnit(unit, food?.defaultUnit || 'g');

  if (normalizedU === 'kg' || normalizedU === 'l') {
    return qty * 1000;
  }
  if (normalizedU === 'g' || normalizedU === 'ml') {
    return qty;
  }

  if (food?.unitConversions && food.unitConversions[normalizedU]) {
    return qty * food.unitConversions[normalizedU];
  }

  if (food?.servingWeight && food.defaultUnit !== 'g') {
    return qty * food.servingWeight;
  }

  return qty;
}

export function calculateNutrientsFromWeight(
  weightInGrams: number,
  per100g: { kcal: number; carbs: number; fat: number; fibre: number; protein: number }
) {
  const factor = (weightInGrams || 0) / 100;
  return {
    weight: Math.round(weightInGrams * 10) / 10,
    kcal: Math.round((per100g.kcal || 0) * factor),
    carbs: Math.round((per100g.carbs || 0) * factor * 10) / 10,
    fat: Math.round((per100g.fat || 0) * factor * 10) / 10,
    fibre: Math.round((per100g.fibre || 0) * factor * 10) / 10,
    protein: Math.round((per100g.protein || 0) * factor * 10) / 10,
  };
}

export function findBestFoodMatch(searchQuery: string, database: FoodDatabaseItem[] = getAllFoods()): FoodDatabaseItem | null {
  if (!searchQuery || !searchQuery.trim()) return null;

  const cleanQuery = searchQuery.toLowerCase().trim();
  const queryTokens = cleanQuery.split(/[\s,+/_-]+/).filter(Boolean);

  let bestMatch: FoodDatabaseItem | null = null;
  let highestScore = 0;

  for (const item of database) {
    let score = 0;
    const itemName = item.name.toLowerCase();
    const allSearchable = [itemName, ...(item.aliases || [])];

    for (const term of allSearchable) {
      if (term === cleanQuery) {
        score = 1000;
        break;
      }
      if (cleanQuery.includes(term) || term.includes(cleanQuery)) {
        score = Math.max(score, 500 + term.length);
      }
    }

    if (score < 1000) {
      let matchedTokens = 0;
      for (const token of queryTokens) {
        if (allSearchable.some((alias) => alias.includes(token))) {
          matchedTokens++;
        }
      }
      if (matchedTokens > 0) {
        const tokenScore = (matchedTokens / queryTokens.length) * 200 + matchedTokens * 20;
        score = Math.max(score, tokenScore);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  return highestScore >= 40 ? bestMatch : null;
}

export function parseFoodQuery(inputStr: string): FoodEntry | null {
  if (!inputStr || !inputStr.trim()) return null;

  const raw = inputStr.trim();

  // Pattern 1: Starts with quantity e.g. "10h soya chunks dry"
  const startPattern = /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s+(.+)$/i;
  // Pattern 2: Ends with quantity e.g. "soya chunks 10h"
  const endPattern = /^(.+?)\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/i;

  let quantity = 100;
  let rawUnit = 'g';
  let foodQuery = raw;

  const startMatch = raw.match(startPattern);
  if (startMatch) {
    quantity = parseFloat(startMatch[1]);
    rawUnit = startMatch[2] || '';
    foodQuery = startMatch[3].trim();
  } else {
    const endMatch = raw.match(endPattern);
    if (endMatch) {
      foodQuery = endMatch[1].trim();
      quantity = parseFloat(endMatch[2]);
      rawUnit = endMatch[3] || '';
    }
  }

  if (rawUnit.toLowerCase() === 'h') {
    rawUnit = 'g';
  }

  const matchedFood = findBestFoodMatch(foodQuery);

  if (matchedFood) {
    if (!rawUnit) {
      rawUnit = matchedFood.defaultUnit || 'g';
    }

    const weightInGrams = calculateGrams(quantity, rawUnit, matchedFood);
    const calculated = calculateNutrientsFromWeight(weightInGrams, matchedFood.per100g);

    return {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: matchedFood.name,
      weight: calculated.weight,
      kcal: calculated.kcal,
      carbs: calculated.carbs,
      fat: calculated.fat,
      fibre: calculated.fibre,
      protein: calculated.protein,
      per100g: matchedFood.per100g,
      rawQuery: raw,
      isCustom: false,
    };
  }

  const parsedWeight = quantity ? (rawUnit.toLowerCase() === 'kg' ? quantity * 1000 : quantity) : 100;
  return {
    id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: foodQuery.charAt(0).toUpperCase() + foodQuery.slice(1),
    weight: parsedWeight,
    kcal: Math.round(parsedWeight * 1.5),
    carbs: Math.round(parsedWeight * 0.15),
    fat: Math.round(parsedWeight * 0.05),
    fibre: 1.0,
    protein: Math.round(parsedWeight * 0.1),
    per100g: {
      kcal: 150,
      carbs: 15,
      fat: 5,
      fibre: 1,
      protein: 10,
    },
    rawQuery: raw,
    isCustom: true,
  };
}
