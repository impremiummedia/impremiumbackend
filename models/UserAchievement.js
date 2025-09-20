// models/UserAchievement.js
import mongoose from 'mongoose';

const UserAchievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, index: true },
  achievement: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' },
  awardedAt: { type: Date, default: Date.now },
  sourceEvent: String
});

export default  mongoose.model('UserAchievement', UserAchievementSchema);
