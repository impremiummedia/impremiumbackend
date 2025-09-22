import mongoose from "mongoose";

const QuestSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  title: String,
  type: { type: String, enum: ["daily", "weekly", "special"], default: "daily" }, // 🔥 challenge type
  steps: [{ id: String, label: String, target: Number }],
  reward: { 
    xp: { type: Number, default: 0 }, 
    coins: { type: Number, default: 0 }, 
    achievementKey: String 
  }
});

export default mongoose.model("Quest", QuestSchema);
