import UserXP from "../models/UserXP.js";

export const addXP = async (userId, amount) => {
  try {
    let userXP = await UserXP.findOne({ userId });
    if (!userXP) {
      userXP = new UserXP({ userId, xp: 0, level: 0 });
    }

    userXP.xp += amount;
    userXP.level = Math.floor(userXP.xp / 100); // example leveling formula
    userXP.lastUpdated = new Date();
    await userXP.save();

    return userXP;
  } catch (err) {
    console.error("Error adding XP:", err);
    throw err;
  }
};
