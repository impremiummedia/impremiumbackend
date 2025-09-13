import Project from "../models/Project.js";
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
