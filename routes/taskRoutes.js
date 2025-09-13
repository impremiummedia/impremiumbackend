import express from "express";
import { assignTask, updateTaskProgress, giveFeedback, getEmployeeTasks, getProjectTasks } from "../controllers/taskController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",authMiddleware, assignTask);
router.put("/:taskId/progress", authMiddleware, updateTaskProgress);
router.put("/:taskId/feedback", authMiddleware, giveFeedback);
router.get("/employee/:employeeId", authMiddleware, getEmployeeTasks);
router.get("/project/:projectId", authMiddleware, getProjectTasks);

export default router;
