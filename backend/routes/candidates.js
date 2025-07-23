// backend/routes/candidates.js
import express from "express";
import Resume from "../models/Resume.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";
import scoringService from "../services/scoringService.js";
import { sendShortlistEmail } from "../services/emailService.js";

const router = express.Router();

/**
 * GET /api/candidates/my/scores
 * — Student dashboard: return this student's resume jobScores
 */
router.get(
  "/my/scores",
  authenticateJWT,
  requireRole(["student"]),
  async (req, res) => {
    try {
      const resume = await Resume.findOne({ student: req.user._id }).populate({
        path: "jobScores.jobId",
        select: "title company scoreThreshold",
      });

      if (!resume) {
        return res.status(404).json({ message: "No resume found" });
      }

      const scores = resume.jobScores.map((js) => ({
        job: js.jobId,
        score: js.score,
        meetsThreshold: js.score >= js.jobId.scoreThreshold,
        calculatedAt: js.calculatedAt,
      }));

      return res.json({ resumeId: resume._id, scores });
    } catch (err) {
      console.error("Get my scores error:", err);
      return res
        .status(500)
        .json({ message: "Failed to fetch your ATS scores" });
    }
  }
);

/**
 * GET /api/candidates/job/:jobId
 * — Recruiter: fetch completed resumes that meet the job’s threshold
 */
router.get(
  "/job/:jobId",
  authenticateJWT,
  requireRole(["recruiter"]),
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = await Job.findById(jobId);
      if (!job || job.recruiter.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const resumes = await Resume.find({
        processingStatus: "completed",
        parsedData: { $exists: true },
      }).populate("student", "name email university major");

      const candidates = [];
      for (const r of resumes) {
        const { score, skillMatches, bonusFactors, calculatedAt } =
          await scoringService.calculateJobMatchScore(
            { resumeId: r._id, parsedData: r.parsedData },
            job
          );
        if (score >= job.scoreThreshold) {
          candidates.push({
            resumeId: r._id,
            student: r.student,
            score,
            skillMatches,
            bonusFactors,
            calculatedAt,
          });
        }
      }

      return res.json({ candidates });
    } catch (err) {
      console.error("Get candidates error:", err);
      return res
        .status(500)
        .json({ message: "Error fetching matched candidates" });
    }
  }
);

/**
 * POST /api/candidates/shortlist
 * — Recruiter: mark a candidate as shortlisted and send email
 */
router.post(
  "/shortlist",
  authenticateJWT,
  requireRole(["recruiter"]),
  async (req, res) => {
    try {
      const { jobId, resumeId } = req.body;
      const job = await Job.findById(jobId);
      const resume = await Resume.findById(resumeId).populate("student");
      if (!job || job.recruiter.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      // Mark shortlisted flag in resume.jobScores
      const idx = resume.jobScores.findIndex(
        (js) => js.jobId.toString() === jobId
      );
      if (idx >= 0) resume.jobScores[idx].shortlisted = true;
      else
        resume.jobScores.push({
          jobId: job._id,
          score: 0,
          skillMatches: [],
          shortlisted: true,
        });

      await resume.save();
      await sendShortlistEmail(resume.student.email, job.title, job._id);

      return res.json({ success: true });
    } catch (err) {
      console.error("Shortlist error:", err);
      return res.status(500).json({ message: "Error shortlisting candidate" });
    }
  }
);

/**
 * POST /api/candidates/apply
 * — Student: apply to a job
 */
router.post(
  "/apply",
  authenticateJWT,
  requireRole(["student"]),
  async (req, res) => {
    try {
      const { jobId } = req.body;
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });

      job.applicationsCount = (job.applicationsCount || 0) + 1;
      await job.save();

      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { appliedJobs: job._id },
      });

      return res.json({ success: true });
    } catch (err) {
      console.error("Apply error:", err);
      return res.status(500).json({ message: "Failed to apply" });
    }
  }
);

router.get(
  "/overview",
  authenticateJWT,
  requireRole(["recruiter"]),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const skip = (page - 1) * limit;

      // Find students who have a completed resume
      const matchStudents = await User.find({
        role: "student",
        resumeId: { $exists: true },
        // optional text search on name/email
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      })
        .populate({
          path: "resumeId",
          match: { processingStatus: "completed" },
          select: "parsedData createdAt",
        })
        .skip(parseInt(skip))
        .limit(parseInt(limit));

      // Filter out those whose resume isn’t completed
      const candidates = matchStudents
        .filter((u) => u.resumeId)
        .map((u) => ({
          studentId: u._id,
          name: u.name,
          email: u.email,
          university: u.university,
          major: u.major,
          graduationYear: u.graduationYear,
          resumeId: u.resumeId._id,
          uploadedAt: u.resumeId.createdAt,
          skills: u.resumeId.parsedData?.skills?.map((s) => s.name) || [],
        }));

      // Total count (no skip/limit)
      const total = await User.countDocuments({
        role: "student",
        resumeId: { $exists: true },
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      });

      return res.json({
        candidates,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      console.error("Overview error:", err);
      res.status(500).json({ message: "Failed to fetch candidates overview" });
    }
  }
);

export default router;
