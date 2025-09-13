import express from "express";
import { createEmployee, deleteEmployee, getEmployees } from "../controllers/employeeController.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Employer can create an employee
router.post("/", authMiddleware, requireRole("employer"), createEmployee);

// ✅ Employer can view their employees
router.get("/", authMiddleware, requireRole("employer"), getEmployees);

// ✅ Employer can delete an employee
router.delete("/:employeeId", authMiddleware, requireRole("employer"), deleteEmployee);

export default router;
