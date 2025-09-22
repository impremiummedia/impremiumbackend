// models/Streak.js
import mongoose from 'mongoose';

const StreakSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, unique: true },
  currentStreak: { type: Number, default: 1 },
  lastLoginAt: { type: Date, default: Date.now },
  longestStreak: { type: Number, default: 1 }
});

export default  mongoose.model('Streak', StreakSchema);
