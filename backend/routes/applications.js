import express from "express";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/:jobId",
  authenticateJWT,
  requireRole(["student"]),
  async (req, res) => {
    try {
      await Application.create({
        job: req.params.jobId,
        student: req.user._id,
      });
      await Job.findByIdAndUpdate(req.params.jobId, {
        $inc: { applicationsCount: 1 },
      });
      res.json({ success: true });
    } catch (err) {
      if (err.code === 11000)
        return res.status(400).json({ message: "Already applied" });
      console.error(err);
      res.status(500).json({ message: "Apply failed" });
    }
  }
);

router.get("/", authenticateJWT, requireRole(["student"]), async (req, res) => {
  try {
    const apps = await Application.find({ student: req.user._id }).select(
      "job"
    );
    const appliedIds = apps.map((a) => a.job.toString());
    res.json({ appliedIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch failed" });
  }
});

export default router;
