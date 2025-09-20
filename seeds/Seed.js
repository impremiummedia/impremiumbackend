// // seed.js
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import Achievement from "../models/Achievement.js";
// import Quest from "../models/Quest.js";
// import { ACHIEVEMENT_ACTION } from "../constants/achievementsAction.js";

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
//       },
//       {
//         key: ACHIEVEMENT_ACTION.STREAK_3,
//         name: "3-Day Streak",
//         description: "Logged in 3 days in a row",
//         icon: "🔥",
//         xp: 50,
//       },
//       {
//         key: ACHIEVEMENT_ACTION.STREAK_7,
//         name: "7-Day Streak",
//         description: "Logged in 7 days in a row",
//         icon: "🏆",
//         xp: 100,
//       },
//       {
//         key: ACHIEVEMENT_ACTION.PROFILE_COMPLETE,
//         name: "Profile Perfect",
//         description: "Completed profile setup",
//         icon: "✅",
//         xp: 30,
//       },
//       {
//         key: ACHIEVEMENT_ACTION.ONBOARDING_MASTER,
//         name: "Onboarding Master",
//         description: "Completed all onboarding steps",
//         icon: "🚀",
//         xp: 100,
//       },
//     ];

//     // --- Quests ---
//     const quests = [
//       {
//         key: "getting_started",
//         title: "Getting Started Quest",
//         steps: [
//           { id: "signup", label: "Sign up", target: 1 },
//           { id: "login", label: "Login once", target: 1 },
//           { id: "profile", label: "Complete profile", target: 1 },
//         ],
//         reward: { xp: 100, achievementKey: ACHIEVEMENT_ACTION.ONBOARDING_MASTER },
//       },
//     ];

//     // Insert / update
//     for (const a of achievements) {
//       await Achievement.updateOne({ key: a.key }, a, { upsert: true });
//     }
//     for (const q of quests) {
//       await Quest.updateOne({ key: q.key }, q, { upsert: true });
//     }

//     console.log("✅ Seeding completed");
//     process.exit();
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// };

// seed();
