// Verified Nutrition Database (per 100g base values)
// Includes common Indian, Gym, and Global staple foods

export interface FoodDatabaseItem {
  id: string;
  name: string;
  aliases: string[];
  defaultUnit: string;
  unitConversions?: Record<string, number>;
  servingWeight: number;
  category: string;
  per100g: {
    kcal: number;
    carbs: number;
    fat: number;
    fibre: number;
    protein: number;
  };
}

export const FOOD_DATABASE: FoodDatabaseItem[] = [
  {
    id: 'soya_chunks_dry',
    name: 'Soya Chunks (Dry)',
    aliases: ['soya chunks dry', 'soya chunks', 'soya chunk', 'soya chunk dry', 'soy chunks', 'soy chunk', 'soya badi', 'nutrela', 'nutrela chunks', 'mealmaker'],
    defaultUnit: 'g',
    servingWeight: 100,
    category: 'High Protein / Veg',
    per100g: {
      kcal: 345,
      carbs: 33.0,
      fat: 0.5,
      fibre: 13.0,
      protein: 52.0,
    },
  },
  {
    id: 'soya_chunks_cooked',
    name: 'Soya Chunks (Cooked/Boiled)',
    aliases: ['soya chunks cooked', 'cooked soya chunks', 'boiled soya chunks', 'soya chunks boiled'],
    defaultUnit: 'g',
    servingWeight: 100,
    category: 'High Protein / Veg',
    per100g: {
      kcal: 115,
      carbs: 11.0,
      fat: 0.2,
      fibre: 4.3,
      protein: 17.3,
    },
  },
  {
    id: 'chicken_breast_raw',
    name: 'Chicken Breast (Raw)',
    aliases: ['chicken breast raw', 'raw chicken breast', 'raw chicken'],
    defaultUnit: 'g',
    servingWeight: 100,
    category: 'High Protein / Non-Veg',
    per100g: {
      kcal: 120,
      carbs: 0.0,
      fat: 2.6,
      fibre: 0.0,
      protein: 22.5,
    },
  },
  {
    id: 'chicken_breast_cooked',
    name: 'Chicken Breast (Cooked/Grilled)',
    aliases: ['chicken breast', 'chicken breast cooked', 'grilled chicken breast', 'boiled chicken breast', 'chicken'],
    defaultUnit: 'g',
    servingWeight: 100,
    category: 'High Protein / Non-Veg',
    per100g: {
      kcal: 165,
      carbs: 0.0,
      fat: 3.6,
      fibre: 0.0,
      protein: 31.0,
    },
  },
  {
    id: 'egg_whole',
    name: 'Egg (Whole)',
    aliases: ['egg', 'eggs', 'whole egg', 'whole eggs', 'boiled egg', 'boiled eggs', 'ande'],
    defaultUnit: 'pcs',
    unitConversions: {
      pcs: 50,
      piece: 50,
      egg: 50,
      eggs: 50,
      g: 1,
    },
    servingWeight: 50,
    category: 'High Protein / Non-Veg',
    per100g: {
      kcal: 143,
      carbs: 0.7,
      fat: 9.5,
      fibre: 0.0,
      protein: 12.6,
    },
  },
  {
    id: 'egg_white',
    name: 'Egg White',
    aliases: ['egg white', 'egg whites', 'white of egg', 'egg white only'],
    defaultUnit: 'pcs',
    unitConversions: {
      pcs: 33,
      piece: 33,
      g: 1,
    },
    servingWeight: 33,
    category: 'High Protein / Non-Veg',
    per100g: {
      kcal: 52,
      carbs: 0.7,
      fat: 0.2,
      fibre: 0.0,
      protein: 11.0,
    },
  },
  {
    id: 'paneer_regular',
    name: 'Paneer (Cottage Cheese)',
    aliases: ['paneer', 'cottage cheese', 'indian cottage cheese'],
    defaultUnit: 'g',
    servingWeight: 100,
    category: 'Dairy / Protein',
    per100g: {
      kcal: 296,
      carbs: 4.5,
      fat: 22.0,
      fibre: 0.0,
      protein: 18.3,
    },
  },
  {
    id: 'paneer_lowfat',
    name: 'Paneer (Low Fat)',
    aliases: ['low fat paneer', 'lowfat paneer', 'skimmed paneer', 'diet paneer'],
    defaultUnit: 'g',
    servingWeight: 100,
    category: 'Dairy / Protein',
    per100g: {
      kcal: 170,
      carbs: 3.0,
      fat: 6.0,
      fibre: 0.0,
      protein: 25.0,
    },
  },
  {
    id: 'tofu_firm',
    name: 'Tofu (Firm)',
    aliases: ['tofu', 'firm tofu', 'soy paneer'],
    defaultUnit: 'g',
    servingWeight: 100,
    category: 'Vegan Protein',
    per100g: {
      kcal: 83,
      carbs: 1.5,
      fat: 5.0,
      fibre: 1.0,
      protein: 10.0,
    },
  },
  {
    id: 'whey_protein',
    name: 'Whey Protein Powder',
    aliases: ['whey', 'whey protein', 'protein powder', 'whey isolate', 'whey concentrate', 'scoop whey'],
    defaultUnit: 'scoop',
    unitConversions: {
      scoop: 33,
      scoops: 33,
      g: 1,
    },
    servingWeight: 33,
    category: 'Supplements',
    per100g: {
      kcal: 390,
      carbs: 7.5,
      fat: 4.5,
      fibre: 1.0,
      protein: 78.0,
    },
  },
  {
    id: 'roti_chapati',
    name: 'Roti / Chapati (Whole Wheat)',
    aliases: ['roti', 'rotis', 'chapati', 'chapatis', 'phulka', 'phulkas', 'fulka'],
    defaultUnit: 'pcs',
    unitConversions: {
      pcs: 35,
      piece: 35,
      roti: 35,
      rotis: 35,
      chapati: 35,
      chapatis: 35,
      g: 1,
    },
    servingWeight: 35,
    category: 'Grains / Carbs',
    per100g: {
      kcal: 297,
      carbs: 56.0,
      fat: 3.0,
      fibre: 10.0,
      protein: 11.0,
    },
  },
  {
    id: 'rice_white_cooked',
    name: 'White Rice (Cooked)',
    aliases: ['rice', 'white rice', 'cooked rice', 'boiled rice', 'steamed rice', 'chawal'],
    defaultUnit: 'g',
    servingWeight: 100,
    category: 'Grains / Carbs',
    per100g: {
      kcal: 130,
      carbs: 28.2,
      fat: 0.3,
      fibre: 0.4,
      protein: 2.7,
    },
  },
  {
    id: 'rice_brown_cooked',
    name: 'Brown Rice (Cooked)',
    aliases: ['brown rice', 'cooked brown rice', 'boiled brown rice'],
    defaultUnit: 'g',
    servingWeight: 100,
    category: 'Grains / Carbs',
    per100g: {
      kcal: 112,
      carbs: 23.5,
      fat: 0.9,
      fibre: 1.8,
      protein: 2.6,
    },
  },
  {
    id: 'oats_rolled',
    name: 'Oats (Rolled / Raw)',
    aliases: ['oats', 'rolled oats', 'oatmeal', 'raw oats', 'quaker oats', 'instant oats'],
    defaultUnit: 'g',
    servingWeight: 50,
    category: 'Grains / Complex Carbs',
    per100g: {
      kcal: 389,
      carbs: 66.3,
      fat: 6.9,
      fibre: 10.6,
      protein: 16.9,
    },
  },
  {
    id: 'peanut_butter',
    name: 'Peanut Butter',
    aliases: ['peanut butter', 'pb', 'pintola', 'myfitness', 'creamy peanut butter'],
    defaultUnit: 'tbsp',
    unitConversions: {
      tbsp: 16,
      tsp: 5,
      g: 1,
    },
    servingWeight: 32,
    category: 'Healthy Fats / Protein',
    per100g: {
      kcal: 588,
      carbs: 20.0,
      fat: 50.0,
      fibre: 6.0,
      protein: 25.0,
    },
  },
  {
    id: 'milk_toned',
    name: 'Cow Milk (Toned)',
    aliases: ['milk', 'cow milk', 'toned milk', 'doodh'],
    defaultUnit: 'ml',
    unitConversions: {
      ml: 1,
      cup: 240,
      glass: 250,
      g: 1,
    },
    servingWeight: 250,
    category: 'Dairy',
    per100g: {
      kcal: 58,
      carbs: 4.8,
      fat: 3.0,
      fibre: 0.0,
      protein: 3.2,
    },
  },
  {
    id: 'curd_dahi',
    name: 'Curd / Dahi',
    aliases: ['curd', 'dahi', 'yogurt', 'plain yogurt'],
    defaultUnit: 'g',
    servingWeight: 150,
    category: 'Dairy',
    per100g: {
      kcal: 61,
      carbs: 4.7,
      fat: 3.3,
      fibre: 0.0,
      protein: 3.5,
    },
  },
  {
    id: 'banana',
    name: 'Banana',
    aliases: ['banana', 'bananas', 'kela'],
    defaultUnit: 'pcs',
    unitConversions: {
      pcs: 120,
      piece: 120,
      banana: 120,
      g: 1,
    },
    servingWeight: 120,
    category: 'Fruits / Carbs',
    per100g: {
      kcal: 89,
      carbs: 22.8,
      fat: 0.3,
      fibre: 2.6,
      protein: 1.1,
    },
  },
  {
    id: 'apple',
    name: 'Apple',
    aliases: ['apple', 'apples', 'seb'],
    defaultUnit: 'pcs',
    unitConversions: {
      pcs: 150,
      piece: 150,
      apple: 150,
      g: 1,
    },
    servingWeight: 150,
    category: 'Fruits',
    per100g: {
      kcal: 52,
      carbs: 13.8,
      fat: 0.2,
      fibre: 2.4,
      protein: 0.3,
    },
  },
  {
    id: 'sweet_potato',
    name: 'Sweet Potato (Boiled)',
    aliases: ['sweet potato', 'shakarkandi', 'boiled sweet potato'],
    defaultUnit: 'g',
    servingWeight: 150,
    category: 'Complex Carbs',
    per100g: {
      kcal: 86,
      carbs: 20.1,
      fat: 0.1,
      fibre: 3.0,
      protein: 1.6,
    },
  },
];

export function getAllFoods(): FoodDatabaseItem[] {
  try {
    const custom = localStorage.getItem('dailylog_custom_foods');
    if (custom) {
      const customList: FoodDatabaseItem[] = JSON.parse(custom);
      return [...FOOD_DATABASE, ...customList];
    }
  } catch (e) {
    console.error('Error loading custom foods:', e);
  }
  return FOOD_DATABASE;
}
