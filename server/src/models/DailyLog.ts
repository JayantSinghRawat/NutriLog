import mongoose, { Document, Schema } from 'mongoose';

export interface IFoodEntry {
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
}

export interface INutrientTotals {
  weight: number;
  kcal: number;
  carbs: number;
  fat: number;
  fibre: number;
  protein: number;
}

export interface IDailyLog extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
  entries: IFoodEntry[];
  totals: INutrientTotals;
  updatedAt: Date;
}

const FoodEntrySchema = new Schema<IFoodEntry>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    weight: { type: Number, required: true, default: 100 },
    kcal: { type: Number, required: true, default: 0 },
    carbs: { type: Number, required: true, default: 0 },
    fat: { type: Number, required: true, default: 0 },
    fibre: { type: Number, required: true, default: 0 },
    protein: { type: Number, required: true, default: 0 },
    per100g: {
      kcal: Number,
      carbs: Number,
      fat: Number,
      fibre: Number,
      protein: Number,
    },
    rawQuery: String,
    isCustom: Boolean,
  },
  { _id: false }
);

const DailyLogSchema = new Schema<IDailyLog>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    entries: [FoodEntrySchema],
    totals: {
      weight: { type: Number, default: 0 },
      kcal: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fibre: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
    },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Compound index on userId + date
DailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyLog = mongoose.model<IDailyLog>('DailyLog', DailyLogSchema);
