import UserAchievement from "../models/UserAchievement.js";
import Achievement from "../models/Achievement.js";
import { addXP } from "./UserXPController.js";

export const awardAchievement = async (userId, achievementKey, sourceEvent = "system") => {
  try {
    const achievement = await Achievement.findOne({ key: achievementKey });
    if (!achievement) return null;

    const already = await UserAchievement.findOne({
      user: userId,
      achievement: achievement._id,
    });
    if (already) return null;

    // create achievement record
    const newUA = await UserAchievement.create({
      user: userId,
      achievement: achievement._id,
      awardedAt: new Date(),
      sourceEvent,
    });

    // grant XP via XP controller
    await addXP(userId, achievement.xp);

    return newUA;
  } catch (err) {
    console.error("Error awarding achievement:", err);
    throw err;
  }
};
