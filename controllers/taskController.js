import Task from "../models/Task.js";
import User from "../models/User.js";
import Project from "../models/Project.js";

// Employer assigns task to employee
export const assignTask = async (req, res) => {
  try {
    const { title, description, deadline, projectId, employeeId } = req.body;

    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== "employee") {
      return res.status(400).json({ msg: "Invalid employee" });
    }

    const task = new Task({ title, description, deadline, projectId, assignedTo: employeeId });
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Employee updates task progress
export const updateTaskProgress = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completion, status } = req.body;

    const task = await Task.findByIdAndUpdate(
      taskId,
      { completion, status },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Employer gives feedback
export const giveFeedback = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { feedback } = req.body;

    const task = await Task.findByIdAndUpdate(taskId, { feedback }, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Employee view their tasks
export const getEmployeeTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const tasks = await Task.find({ assignedTo: employeeId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Employer view all tasks in a project
export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ projectId }).populate("assignedTo", "name email");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
