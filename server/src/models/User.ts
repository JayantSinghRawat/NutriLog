import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyGoals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
}

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  geminiApiKey?: string;
  dailyGoals: IDailyGoals;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    default: 'password123',
  },
  geminiApiKey: {
    type: String,
    default: '',
  },
  dailyGoals: {
    kcal: { type: Number, default: 2200 },
    protein: { type: Number, default: 150 },
    carbs: { type: Number, default: 220 },
    fat: { type: Number, default: 65 },
    fibre: { type: Number, default: 32 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
