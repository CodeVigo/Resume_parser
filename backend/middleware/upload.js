// backend/middleware/upload.js

import dotenv from "dotenv";
dotenv.config();

import multer from "multer";

// 1) Use memoryStorage so we get file.buffer
const storage = multer.memoryStorage();
export const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF/DOC/DOCX allowed"), false);
  },
}).single("resume");

// No change to error‐handler:
export const handleUploadError = (err, req, res, next) => {
  if (err) return res.status(400).json({ message: err.message });
  next();
};
