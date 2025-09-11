import express from "express";
import { createProject, getEmployerProjects, generateClientLink, getClientView } from "../controllers/projectController.js";

const router = express.Router();

router.post("/", createProject);
router.get("/:employerId", getEmployerProjects);
router.post("/:projectId/client-link", generateClientLink);
router.get("/client/:projectId", getClientView);

export default router;
