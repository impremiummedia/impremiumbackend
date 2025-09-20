// models/UserQuest.js
import mongoose from 'mongoose';

const UserQuestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, index: true },
  questId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest' },
  stepStatus: { type: Object, default: {} },
  completed: { type: Boolean, default: false },
  completedAt: Date
});

export default  mongoose.model('UserQuest', UserQuestSchema);
