import express from "express";
import {
  createTask,
  getTasksByProjectEmployer,
  assignTaskToEmployee,
  getMyTasksByProject,
  updateTaskStatusEmployee
} from "../controllers/taskController.js";

import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Employer creates task
router.post("/", authMiddleware, requireRole("employer"), createTask);

// Employer gets all tasks for a project
router.get("/project/:projectId", authMiddleware, requireRole("employer"), getTasksByProjectEmployer);

// Employer assigns task
router.put("/:taskId/assign", authMiddleware, requireRole("employer"), assignTaskToEmployee);

// Employee gets their tasks for a project
router.get("/my/:projectId", authMiddleware, requireRole("employee"), getMyTasksByProject);

// Employee updates task status/progress
router.put("/:taskId/progress", authMiddleware, requireRole("employee"), updateTaskStatusEmployee);

export default router;
