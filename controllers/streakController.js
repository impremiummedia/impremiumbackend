import Streak from "../models/Streak.js";

export const updateStreak = async (userId) => {
  const today = new Date();
  let streak = await Streak.findOne({ userId });

  if (!streak) {
    streak = new Streak({ userId, currentStreak: 1, longestStreak: 1, lastLoginAt: today });
  } else {
    const lastLogin = new Date(streak.lastLoginAt);
    const diffDays = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak.currentStreak += 1;
    } else if (diffDays > 1) {
      streak.currentStreak = 1;
    }

    streak.lastLoginAt = today;
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }
  }

  await streak.save();
  return streak;
};
