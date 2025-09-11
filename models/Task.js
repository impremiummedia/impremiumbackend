import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  deadline: Date,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Employee
  completion: { type: Number, default: 0 }, // % done
  status: { type: String, enum: ["To Do", "In Progress", "Done"], default: "To Do" },
  feedback: String, // Employer feedback
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
