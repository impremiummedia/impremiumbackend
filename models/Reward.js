import mongoose from "mongoose";

const RewardSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  name: String,
  description: String,
  cost: { type: Number, required: true }, // 🪙 cost in coins
  type: { type: String, enum: ["template", "trial", "badge", "addon"], required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Reward", RewardSchema);
