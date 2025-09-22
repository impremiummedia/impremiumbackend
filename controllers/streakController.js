import Streak from "../models/Streak.js";

/**
 * Initialize streak for a user
 * If streak exists, return it; else create new
 * @param {ObjectId} userId
 * @returns {Promise<Streak>}
 */
export const initializeStreak = async (userId) => {
  let streak = await Streak.findOne({ userId });
  const today = new Date();

  if (!streak) {
    streak = new Streak({
      userId,
      currentStreak: 0, // new users start with 0
      lastLoginAt: null,
      longestStreak: 0,
    });
    await streak.save();
  }

  return streak;
};


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
