// backend/routes/jobs.js

import express from "express";
import Job from "../models/Job.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/jobs
 * Fetch all active jobs with optional pagination.
 * Query parameters:
 *   - page (default: 1)
 *   - limit (default: 0 for no limit)
 * Response: { jobs: [...], total: number }
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    const query = { isActive: true };

    const total = await Job.countDocuments(query);

    let cursor = Job.find(query).sort({ createdAt: -1 }).select("-__v");

    if (limit > 0) {
      const skip = (page - 1) * limit;
      cursor = cursor.skip(skip).limit(limit);
    }

    const jobs = await cursor;
    return res.json({ jobs, total });
  } catch (err) {
    console.error("Fetch jobs error:", err);
    return res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// GET /api/jobs/my/jobs — Fetch only this recruiter’s postings
router.get(
  "/my/jobs",
  authenticateJWT,
  requireRole(["recruiter"]),
  async (req, res) => {
    try {
      const jobs = await Job.find({ recruiter: req.user._id })
        .sort({ createdAt: -1 })
        .select("-__v");
      return res.json({ jobs, total: jobs.length });
    } catch (err) {
      console.error("Fetch my jobs error:", err);
      return res.status(500).json({ message: "Failed to fetch your jobs" });
    }
  }
);

// GET /api/jobs/:id — Fetch single job by ID
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).select("-__v");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    return res.json(job);
  } catch (err) {
    console.error("Fetch job detail error:", err);
    return res.status(500).json({ message: "Failed to fetch job detail" });
  }
});

// POST /api/jobs — Create new job (recruiters only)
router.post(
  "/",
  authenticateJWT,
  requireRole(["recruiter"]),
  async (req, res) => {
    try {
      const data = { ...req.body, recruiter: req.user._id };
      const job = await Job.create(data);
      return res.status(201).json(job);
    } catch (err) {
      console.error("Create job error:", err);
      return res.status(400).json({ message: "Invalid job data" });
    }
  }
);

// PUT /api/jobs/:id — Update job (recruiters only & own jobs)
router.put(
  "/:id",
  authenticateJWT,
  requireRole(["recruiter"]),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      if (job.recruiter.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
      Object.assign(job, req.body);
      await job.save();
      return res.json(job);
    } catch (err) {
      console.error("Update job error:", err);
      return res.status(400).json({ message: "Invalid update data" });
    }
  }
);

// DELETE /api/jobs/:id — Delete job (recruiters only & own jobs)
router.delete(
  "/:id",
  authenticateJWT,
  requireRole(["recruiter"]),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      if (job.recruiter.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
      await job.remove();
      return res.json({ message: "Job deleted" });
    } catch (err) {
      console.error("Delete job error:", err);
      return res.status(500).json({ message: "Failed to delete job" });
    }
  }
);

export default router;
