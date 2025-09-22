import Quest from "../models/Quest.js";
import UserQuest from "../models/UserQuest.js";
import UserAchievement from "../models/UserAchievement.js";
import Achievement from "../models/Achievement.js";
import { QUEST_KEYS } from "../constants/questKeys.js";
import { addXP } from "./userXPController.js";

/**
 * Initialize quests for a user
 */
export const initializeQuests = async (userId) => {
  // Example: only assign core quests or specific quests for new users
  const questKeysToAssign = [
    QUEST_KEYS.DAILY_LOGIN,
    QUEST_KEYS.UPDATE_PROFILE,
    QUEST_KEYS.POST_TIKTOK,
  ];

  const quests = await Quest.find({ key: { $in: questKeysToAssign } });
  const userQuests = [];

  for (const quest of quests) {
    let uq = await UserQuest.findOne({ userId, questId: quest._id });
    if (!uq) {
      uq = new UserQuest({
        userId,
        questId: quest._id,
        stepStatus: {},
        completed: false,
      });
      await uq.save();
    }
    userQuests.push(uq);
  }

  return userQuests;
};

/**
 * Update quest step progress
 */
export const updateQuestStep = async (userId, questKey, stepId) => {
  const quest = await Quest.findOne({ key: questKey });
  if (!quest) throw new Error("Quest not found");

  let uq = await UserQuest.findOne({ userId, questId: quest._id });
  if (!uq) {
    uq = new UserQuest({ userId, questId: quest._id, stepStatus: {} });
  }

  uq.stepStatus[stepId] = (uq.stepStatus[stepId] || 0) + 1;

  // Check completion
  const completed = quest.steps.every(step => {
    const val = uq.stepStatus[step.id] || 0;
    return step.target ? val >= step.target : !!val;
  });

  if (completed && !uq.completed) {
    uq.completed = true;
    uq.completedAt = new Date();

    // Quest rewards
    if (quest.reward?.xp) await addXP(userId, quest.reward.xp);

    if (quest.reward?.achievementKey) {
      const achievement = await Achievement.findOne({ key: quest.reward.achievementKey });
      if (achievement) {
        const already = await UserAchievement.findOne({ userId, achievementId: achievement._id });
        if (!already) {
          await UserAchievement.create({
            userId,
            achievementId: achievement._id,
            sourceEvent: "quest_completion",
            awardedAt: new Date(),
          });
        }
      }
    }
  }

  await uq.save();
  return uq;
};
