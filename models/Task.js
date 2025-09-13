import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  deadline: Date,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Employee
  completion: { type: Number, default: 0 }, // % done
  status: { type: String, enum: ["PENDING", "IN_PROGRESS", "DONE"], default: "PENDING" },
  feedback: String, // Employer feedback
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
