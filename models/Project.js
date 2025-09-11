import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Employer
  clientLink: { type: String }, // optional shareable link
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
