import UserReward from "../models/UserReward.js";

// ✅ Get logged-in user rewards
export const getUserRewards = async (req, res) => {
  try {
    const userId = req.user.id; // injected by authMiddleware

    const rewards = await UserReward.find({ userId }).sort({ awardedAt: -1 });

    res.json({
      success: true,
      data: rewards,
      msg: `Found ${rewards.length} rewards for this user`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
