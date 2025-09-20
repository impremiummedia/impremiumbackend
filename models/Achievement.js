import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: String,
  description: String,
  icon: String,
  xp: { type: Number, default: 50 },
  coins: { type: Number, default: 0 }, // 🪙 optional coin reward
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Achievement", AchievementSchema);
