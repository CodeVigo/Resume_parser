// backend/models/Application.js

import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a student can apply to a given job only once
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
