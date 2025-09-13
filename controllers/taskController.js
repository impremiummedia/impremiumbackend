import Task from "../models/Task.js";
import User from "../models/User.js";
import Project from "../models/Project.js";

// ----------------- CREATE TASK (Employer creates task inside project) -----------------
export const createTask = async (req, res) => {
  try {
    const { title, description, deadline, projectId, assignedTo } = req.body;

    // ✅ Ensure project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    let employee = null;
    if (assignedTo) {
      // Only validate if provided
      employee = await User.findById(assignedTo);
      if (!employee || employee.role !== "employee") {
        return res.status(400).json({ msg: "Invalid employee" });
      }
    }

    const task = new Task({
      title,
      description,
      deadline,
      projectId,
      assignedTo: employee ? employee._id : undefined // 👈 optional
    });

    await task.save();
    res.json({ msg: "Task created successfully", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ----------------- EMPLOYER → Get all tasks for a project -----------------
export const getTasksByProjectEmployer = async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await Task.find({ projectId }).populate("assignedTo", "name email");
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ----------------- EMPLOYER → Assign task to employee (alternative route) -----------------
export const assignTaskToEmployee = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { employeeId } = req.body;

    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== "employee") {
      return res.status(400).json({ msg: "Invalid employee" });
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      { assignedTo: employeeId },
      { new: true }
    );

    if (!task) return res.status(404).json({ msg: "Task not found" });

    res.json({ msg: "Task assigned successfully", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ----------------- EMPLOYEE → Get all tasks in a project assigned to me -----------------
export const getMyTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const employeeId = req.user.id; // from authMiddleware

    const tasks = await Task.find({ projectId, assignedTo: employeeId });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ----------------- EMPLOYEE → Update task progress (status + % completion) -----------------
export const updateTaskStatusEmployee = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completion, status } = req.body;
    const employeeId = req.user.id; // logged-in employee

    const task = await Task.findOne({ _id: taskId, assignedTo: employeeId });
    if (!task) return res.status(404).json({ msg: "Task not found or not assigned to you" });

    task.completion = completion ?? task.completion;
    task.status = status ?? task.status;

    await task.save();

    res.json({ msg: "Task updated successfully", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
