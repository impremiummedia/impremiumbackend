import jwt from "jsonwebtoken";
import { LEVEL_CONFIG } from "../constants/levelConfig.js";

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

export const getLevelFromXp = (xp) => {
  let currentLevel = LEVEL_CONFIG[0];

  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_CONFIG[i].xpRequired) {
      currentLevel = LEVEL_CONFIG[i];
      break;
    }
  }

  return {
    level: currentLevel.level,
    unlock: currentLevel.unlock,
    xpRequired: currentLevel.xpRequired,
  };
};
