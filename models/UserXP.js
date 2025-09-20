// models/UserXP.js
import mongoose from 'mongoose';

const UserXPSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

export default  mongoose.model('UserXP', UserXPSchema);
