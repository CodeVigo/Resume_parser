// backend/routes/upload.js

import express from "express";
import multer from "multer";
import { MongoClient, GridFSBucket } from "mongodb";
import { authenticateJWT, requireRole } from "../middleware/auth.js";
import Resume from "../models/Resume.js";
import User from "../models/User.js";

const router = express.Router();

// In-memory multer setup
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only PDF/DOC/DOCX files allowed"), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
}).single("resume");

// Dummy async processing function
const processResumeAsync = async (resumeId, fileId) => {
  console.log(`🔧 Simulating resume processing for ${resumeId}`);
  // You can integrate real logic here later
};

router.post(
  "/resume",
  authenticateJWT,
  requireRole(["student"]),
  upload,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      const db = client.db("campusRecruitment");
      const bucket = new GridFSBucket(db, { bucketName: "uploads" });

      const filename = `resume_${Date.now()}_${req.file.originalname}`;
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          uploadedBy: req.user._id,
          uploadedAt: new Date(),
        },
      });

      uploadStream.end(req.file.buffer);

      uploadStream.on("error", (err) => {
        console.error("❌ GridFS upload error:", err);
        client.close();
        res.status(500).json({ message: "Upload failed" });
      });

      uploadStream.on("finish", async () => {
        try {
          const resumeDoc = await Resume.create({
            student: req.user._id,
            filename,
            originalName: req.file.originalname,
            fileId: uploadStream.id,
            contentType: req.file.mimetype,
            size: req.file.size,
            processingStatus: "pending",
          });

          await User.findByIdAndUpdate(req.user._id, {
            resumeId: resumeDoc._id,
          });

          client.close();

          // Simulate background processing
          processResumeAsync(resumeDoc._id, uploadStream.id);

          res.status(201).json({
            success: true,
            resumeId: resumeDoc._id,
            filename,
            originalName: req.file.originalname,
          });
        } catch (err) {
          console.error("❌ Error after upload:", err);
          res.status(500).json({ message: "Upload finalization failed" });
        }
      });
    } catch (error) {
      console.error("❌ Upload route error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

export default router;
