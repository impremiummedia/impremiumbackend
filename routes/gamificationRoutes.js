import express from "express";
import {
  getUserXp,
  getUserAchievements,
  getUserQuests,
  getUserStreak,
} from "../controllers/gamificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ All return only logged-in user’s data
router.get("/xp", authMiddleware, getUserXp);
router.get("/achievements", authMiddleware, getUserAchievements);
router.get("/quests", authMiddleware, getUserQuests);
router.get("/streak", authMiddleware, getUserStreak);

export default router;
