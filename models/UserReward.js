import mongoose from "mongoose";

const UserRewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, index: true },
  rewardId: { type: mongoose.Schema.Types.ObjectId, ref: "Reward" },
  redeemedAt: { type: Date, default: Date.now }
});

export default mongoose.model("UserReward", UserRewardSchema);
