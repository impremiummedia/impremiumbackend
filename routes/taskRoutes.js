import express from "express";
import { assignTask, updateTaskProgress, giveFeedback, getEmployeeTasks, getProjectTasks } from "../controllers/taskController.js";

const router = express.Router();

router.post("/", assignTask);
router.put("/:taskId/progress", updateTaskProgress);
router.put("/:taskId/feedback", giveFeedback);
router.get("/employee/:employeeId", getEmployeeTasks);
router.get("/project/:projectId", getProjectTasks);

export default router;
