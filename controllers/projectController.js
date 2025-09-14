import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

// Employer creates a project
export const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    const employerId = req.user.id;

    const employer = await User.findById(employerId);
    if (!employer || employer.role !== "employer") {
      return res.status(400).json({ msg: "Only employers can create projects" });
    }

    const project = new Project({ title, description, createdBy: employerId });
    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all projects for an employer
export const getEmployerProjects = async (req, res) => {
  try {
    const employerId  = req.user.id;
    const projects = await Project.find({ createdBy: employerId });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Generate client link
export const generateClientLink = async (req, res) => {
  try {
    const { projectId } = req.params;
    const clientLink = `https://yourapp.com/client/${projectId}`;
    const project = await Project.findByIdAndUpdate(
      projectId,
      { clientLink },
      { new: true }
    );
    res.json({ clientLink: project.clientLink });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Client view project
export const getClientView = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ projectId }).select("title completion status");
    res.json({ projectId, tasks });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ----------------- GET PROJECTS WHERE EMPLOYEE HAS TASKS -----------------
export const getEmployeeProjects = async (req, res) => {
  try {
    const employeeId = req.user.id; // ✅ from auth middleware (logged-in user)

    // Step 1: Find all tasks assigned to this employee
    const tasks = await Task.find({ assignedTo: employeeId }).select("projectId");

    if (!tasks.length) {
      return res.json({ msg: "No projects found", projects: [] });
    }

    // Step 2: Extract unique project IDs
    const projectIds = [...new Set(tasks.map((task) => task.projectId.toString()))];

    // Step 3: Fetch projects by IDs
    const projects = await Project.find({ _id: { $in: projectIds } });

    res.json({ projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    await Project.findByIdAndDelete(projectId);
    res.status(200).json({ msg: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ msg: "Server error while deleting project" });
  }
};
