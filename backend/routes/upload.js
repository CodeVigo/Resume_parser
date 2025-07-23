import express from "express";
import multer from "multer";
import { MongoClient, GridFSBucket } from "mongodb";
import Resume from "../models/Resume.js";
import Job from "../models/Job.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";
import scoringService from "../services/scoringService.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }).single("resume");

/**
 * POST /api/upload/resume
 * Uploads the resume file to GridFS and creates a Resume document
 */
router.post(
  "/resume",
  authenticateJWT,
  requireRole(["student"]),
  upload,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    try {
      const client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME || "campusRecruitment");
      const bucket = new GridFSBucket(db, { bucketName: "uploads" });

      const filename = `resume_${Date.now()}_${req.file.originalname}`;
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: req.file.mimetype,
        metadata: { student: req.user._id }
      });
      uploadStream.end(req.file.buffer);

      uploadStream.on("finish", async () => {
        const resumeDoc = await Resume.create({
          student: req.user._id,
          fileId: uploadStream.id,
          filename,
          originalName: req.file.originalname,
          contentType: req.file.mimetype,
          size: req.file.size,
          processingStatus: "pending"
        });
        client.close();
        return res.status(201).json({ success: true, resumeId: resumeDoc._id });
      });

      uploadStream.on("error", (err) => {
        client.close();
        console.error("GridFS upload error:", err);
        return res.status(500).json({ message: "Upload failed" });
      });
    } catch (err) {
      console.error("Upload route error:", err);
      return res.status(500).json({ message: "Upload failed" });
    }
  }
);

/**
 * GET /api/upload/resume/:id/parsed
 * Returns parsed resume data, jobScores, and optional ATS score if jobId is provided
 */
router.get(
  "/resume/:id/parsed",
  authenticateJWT,
  requireRole(["student"]),
  async (req, res) => {
    const resumeId = req.params.id;
    const jobId = req.query.jobId;
    try {
      const resume = await Resume.findById(resumeId).lean();
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      if (resume.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
      if (resume.processingStatus !== "completed") {
        return res.status(400).json({ message: "Resume still processing" });
      }

      const response = {
        resumeId: resume._id,
        filename: resume.originalName,
        uploadedAt: resume.createdAt,
        parsedData: resume.parsedData,
        jobScores: resume.jobScores || []
      };

      if (jobId) {
        const job = await Job.findById(jobId).lean();
        if (!job) {
          return res.status(404).json({ message: "Job not found" });
        }
        const scoreResult = await scoringService.calculateJobMatchScore(
          { resumeId: resume._id, parsedData: resume.parsedData, student: resume.student },
          job
        );
        response.jobScore = scoreResult;
      }

      return res.json(response);
    } catch (err) {
      console.error("Fetch parsed error:", err);
      return res.status(500).json({ message: "Failed to fetch parsed data" });
    }
  }
);

/**
 * GET /api/upload/resume/:id/download
 * Streams the original resume file via GridFS
 */
router.get(
  "/resume/:id/download",
  authenticateJWT,
  requireRole(["student", "recruiter"]),
  async (req, res) => {
    try {
      const resume = await Resume.findById(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      const isOwner = resume.student.toString() === req.user._id.toString();
      if (!isOwner && req.user.role !== "recruiter") {
        return res.status(403).json({ message: "Not authorized" });
      }

      const client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME || "campusRecruitment");
      const bucket = new GridFSBucket(db, { bucketName: "uploads" });

      res.setHeader("Content-Type", resume.contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${resume.originalName}"`
      );

      const downloadStream = bucket.openDownloadStream(resume.fileId);
      downloadStream.pipe(res).on("error", (err) => {
        console.error("Download error:", err);
        res.sendStatus(500);
      });
    } catch (err) {
      console.error("Download route error:", err);
      return res.status(500).json({ message: "Failed to download" });
    }
  }
);

export default router;
