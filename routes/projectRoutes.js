import express from "express";
import {
  createProject,
  getEmployerProjects,
  generateClientLink,
  getClientView,
  getEmployeeProjects
} from "../controllers/projectController.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Employer only
router.post("/", authMiddleware, requireRole("employer"), createProject);
router.get("/", authMiddleware, requireRole("employer"), getEmployerProjects);
router.post("/:projectId/client-link", authMiddleware, requireRole("employer"), generateClientLink);

// Client view (public, no login required)
router.get("/client/:projectId", getClientView);

//Employee only
router.get("/me/employee-projects", authMiddleware, requireRole("employee"), getEmployeeProjects);

export default router;
