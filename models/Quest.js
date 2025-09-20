// models/Quest.js
import mongoose from 'mongoose';

const QuestSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  title: String,
  steps: [{ id: String, label: String, target: Number }],
  reward: { xp: Number, achievementKey: String }
});

export default mongoose.model('Quest', QuestSchema);
