// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import Achievement from "../models/Achievement.js";
// import Quest from "../models/Quest.js";
// import { ACHIEVEMENT_ACTION } from "../constants/achievementsAction.js";
// import { QUEST_KEYS } from "../constants/questKeys.js";


// dotenv.config();

// const seed = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ MongoDB Connected");

//     // --- Achievements ---
//     const achievements = [
//       {
//         key: ACHIEVEMENT_ACTION.FIRST_LOGIN,
//         name: "Welcome Aboard!",
//         description: "Logged in for the first time",
//         icon: "🎉",
//         xp: 20,
//         coins: 5,
//       },
//       {
//         key: ACHIEVEMENT_ACTION.STREAK_3,
//         name: "3-Day Streak",
//         description: "Logged in 3 days in a row",
//         icon: "🔥",
//         xp: 50,
//         coins: 20,
//       },
//       {
//         key: ACHIEVEMENT_ACTION.STREAK_7,
//         name: "7-Day Streak",
//         description: "Logged in 7 days in a row",
//         icon: "🏆",
//         xp: 100,
//         coins: 50,
//       },
//       {
//         key: ACHIEVEMENT_ACTION.STREAK_30,
//         name: "30-Day Streak",
//         description: "Logged in 30 days in a row",
//         icon: "🌟",
//         xp: 500,
//         coins: 200,
//       },
//       {
//         key: ACHIEVEMENT_ACTION.PROFILE_COMPLETE,
//         name: "Profile Perfect",
//         description: "Completed profile setup",
//         icon: "✅",
//         xp: 30,
//         coins: 10,
//       },
//       {
//         key: ACHIEVEMENT_ACTION.ONBOARDING_MASTER,
//         name: "Onboarding Master",
//         description: "Completed all onboarding steps",
//         icon: "🚀",
//         xp: 100,
//         coins: 50,
//       },
//       {
//         key: ACHIEVEMENT_ACTION.FIRST_CAMPAIGN,
//         name: "First Campaign",
//         description: "Launched your first campaign",
//         icon: "📢",
//         xp: 200,
//         coins: 100,
//       },
//     ];

//     // --- Quests ---
//     const quests = [
//     {
//         key: QUEST_KEYS.DAILY_LOGIN,
//         title: "Daily Login",
//         type: "daily",
//         steps: [{ id: "login", label: "Log in today", target: 1 }],
//         reward: { xp: 10, coins: 5, achievementKey: ACHIEVEMENT_ACTION.FIRST_LOGIN },
//     },
//     {
//         key: QUEST_KEYS.UPDATE_PROFILE,
//         title: "Update Business Profile",
//         type: "daily",
//         steps: [{ id: "profile", label: "Complete profile steps", target: 1 }],
//         reward: { xp: 20, coins: 10, achievementKey: ACHIEVEMENT_ACTION.PROFILE_COMPLETE },
//     },
//     {
//         key: QUEST_KEYS.POST_TIKTOK,
//         title: "Post TikTok Idea",
//         type: "daily",
//         steps: [{ id: "tiktok_post", label: "Post TikTok Idea", target: 1 }],
//         reward: { xp: 30, coins: 15, achievementKey: null },
//     },
//     {
//         key: QUEST_KEYS.WEEKLY_5DAY_STREAK,
//         title: "5-Day Login Streak",
//         type: "weekly",
//         steps: [{ id: "streak_5", label: "Login 5 consecutive days", target: 5 }],
//         reward: { xp: 100, coins: 50, achievementKey: ACHIEVEMENT_ACTION.STREAK_7 },
//     },
//     {
//         key: QUEST_KEYS.WEEKLY_GMB_OPTIMIZATION,
//         title: "Optimize Google My Business",
//         type: "weekly",
//         steps: [{ id: "gmb_steps", label: "Complete GMB optimization", target: 1 }],
//         reward: { xp: 200, coins: 100, achievementKey: null },
//     },
//     {
//         key: QUEST_KEYS.SPECIAL_FIRST_CAMPAIGN,
//         title: "Launch Your First Campaign",
//         type: "special",
//         steps: [{ id: "campaign", label: "Launch first campaign", target: 1 }],
//         reward: { xp: 500, coins: 200, achievementKey: ACHIEVEMENT_ACTION.FIRST_CAMPAIGN },
//     },
//     ];


//     // Insert / update achievements
//     for (const a of achievements) {
//       await Achievement.updateOne({ key: a.key }, a, { upsert: true });
//     }

//     // Insert / update quests
//     for (const q of quests) {
//       await Quest.updateOne({ key: q.key }, q, { upsert: true });
//     }

//     console.log("✅ Gamification seed completed!");
//     process.exit();
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// };

// seed();
