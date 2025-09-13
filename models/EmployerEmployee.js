import mongoose from "mongoose";

const employerEmployeeSchema = new mongoose.Schema({
  employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  addedAt: { type: Date, default: Date.now }
});

export default mongoose.model("EmployerEmployee", employerEmployeeSchema);
