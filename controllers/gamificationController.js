import UserXP from '../models/UserXP.js';
// import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
// import Quest from '../models/Quest.js';
import UserQuest from '../models/UserQuest.js';
import Streak from '../models/Streak.js';

// Get logged-in user's XP
export const getUserXp = async (req, res) => {
  try {
    const xpDoc = await UserXP.findOne({ userId: req.user._id });
    res.json(xpDoc || { xp: 0, level: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get logged-in user's achievements
export const getUserAchievements = async (req, res) => {
  try {
    const achievements = await UserAchievement
      .find({ userId: req.user._id })
      .populate("achievementId");
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get logged-in user's quests
export const getUserQuests = async (req, res) => {
  try {
    const quests = await UserQuest
      .find({ userId: req.user._id })
      .populate("questId");
    res.json(quests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get logged-in user's streak
export const getUserStreak = async (req, res) => {
  try {
    const streak = await Streak.findOne({ userId: req.user._id });
    res.json(streak || { currentStreak: 0, longestStreak: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

