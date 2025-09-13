import User from "../models/User.js";
import EmployerEmployee from "../models/EmployerEmployee.js";
import bcrypt from "bcrypt";

// ----------------- CREATE EMPLOYEE -----------------
export const createEmployee = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const employerId = req.user.id; // from authMiddleware

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already exists" });

    const hashPass = await bcrypt.hash(password, 10);

    const employee = new User({
      name,
      email,
      password: hashPass,
      role: "employee",
      isVerified: true // created by employer, so auto-verified
    });

    await employee.save();

    // Link employer ↔ employee
    await EmployerEmployee.create({ employerId: employerId, employeeId: employee._id });

    res.json({ msg: "Employee created successfully", employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ----------------- GET EMPLOYEES -----------------
export const getEmployees = async (req, res) => {
  try {
    const employerId = req.user.id;

    const employees = await EmployerEmployee.find({ employer: employerId }).populate("employee", "name email");

    res.json({ employees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ----------------- DELETE EMPLOYEE -----------------
export const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employerId = req.user.id;

    // Check relation exists
    const relation = await EmployerEmployee.findOne({ employer: employerId, employee: employeeId });
    if (!relation) return res.status(404).json({ msg: "Employee not found in your team" });

    // Remove relation
    await EmployerEmployee.deleteOne({ employer: employerId, employee: employeeId });

    // Optional: delete user from DB (if you want)
    await User.findByIdAndDelete(employeeId);

    res.json({ msg: "Employee deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
