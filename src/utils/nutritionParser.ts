/**
 * Pure client-side math helper to rescale nutrients when user modifies weight in the table
 * Uses the per-100g nutritional breakdown returned by the Gemini API.
 */
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
