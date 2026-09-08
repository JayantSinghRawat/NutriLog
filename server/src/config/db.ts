import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutrilog';
  try {
    await mongoose.connect(uri);
    console.log(`[MongoDB] Successfully connected to database at ${uri}`);
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    // Don't exit process so server can still serve fallback or notify client
  }
}
