import express from 'express';
import Resume from '../models/Resume.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import scoringService from '../services/scoringService.js';
import { cacheService } from '../services/redisClient.js';

const router = express.Router();

// Get matched candidates for a job (recruiters only)
router.get('/job/:jobId', authenticateJWT, requireRole(['recruiter']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10, minScore = 0 } = req.query;
    
    // Verify job belongs to recruiter
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view candidates for this job' });
    }
    
    // Get all completed resumes
    const resumes = await Resume.find({ 
      processingStatus: 'completed',
      parsedData: { $exists: true }
    })
    .populate('student', 'name email university major graduationYear')
    .sort({ createdAt: -1 });
    
    if (resumes.length === 0) {
      return res.json({
        candidates: [],
        totalPages: 0,
        currentPage: page,
        total: 0
      });
    }
    
    // Calculate scores for all resumes
    const scoredCandidates = [];
    
    for (const resume of resumes) {
      try {
        const resumeData = {
          resumeId: resume._id,
          parsedData: resume.parsedData,
          student: resume.student
        };
        
        const score = await scoringService.calculateJobMatchScore(resumeData, job);
        
        if (score.score >= minScore && score.score >= job.scoreThreshold) {
          scoredCandidates.push({
            resumeId: resume._id,
            student: resume.student,
            score: score.score,
            skillMatches: score.skillMatches,
            bonusFactors: score.bonusFactors,
            calculatedAt: score.calculatedAt,
            filename: resume.filename,
            originalName: resume.originalName,
            uploadedAt: resume.createdAt
          });
          
          // Update resume with job score
          const existingScoreIndex = resume.jobScores.findIndex(
            js => js.jobId.toString() === jobId
          );
          
          if (existingScoreIndex >= 0) {
            resume.jobScores[existingScoreIndex] = {
              jobId: job._id,
              score: score.score,
              skillMatches: score.skillMatches,
              calculatedAt: score.calculatedAt
            };
          } else {
            resume.jobScores.push({
              jobId: job._id,
              score: score.score,
              skillMatches: score.skillMatches,
              calculatedAt: score.calculatedAt
            });
          }
          
          await resume.save();
        }
      } catch (scoreError) {
        console.error(`Error scoring resume ${resume._id}:`, scoreError);
      }
    }
    
    // Sort by score (highest first)
    scoredCandidates.sort((a, b) => b.score - a.score);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCandidates = scoredCandidates.slice(startIndex, endIndex);
    
    res.json({
      candidates: paginatedCandidates,
      totalPages: Math.ceil(scoredCandidates.length / limit),
      currentPage: parseInt(page),
      total: scoredCandidates.length,
      jobInfo: {
        title: job.title,
        company: job.company,
        scoreThreshold: job.scoreThreshold
      }
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ message: 'Failed to fetch candidates' });
  }
});

// Get candidate detail (recruiters only)
router.get('/detail/:resumeId', authenticateJWT, requireRole(['recruiter']), async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { jobId } = req.query;
    
    const resume = await Resume.findById(resumeId)
      .populate('student', 'name email university major graduationYear skills');
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    let jobScore = null;
    if (jobId) {
      // Get score for specific job
      const job = await Job.findById(jobId);
      if (job) {
        const resumeData = {
          resumeId: resume._id,
          parsedData: resume.parsedData,
          student: resume.student
        };
        jobScore = await scoringService.calculateJobMatchScore(resumeData, job);
      }
    }
    
    res.json({
      resume: {
        id: resume._id,
        filename: resume.originalName,
        uploadedAt: resume.createdAt,
        processingStatus: resume.processingStatus
      },
      student: resume.student,
      parsedData: resume.parsedData,
      jobScore,
      allJobScores: resume.jobScores
    });
  } catch (error) {
    console.error('Get candidate detail error:', error);
    res.status(500).json({ message: 'Failed to fetch candidate details' });
  }
});

// Get all candidates overview (recruiters only)
router.get('/overview', authenticateJWT, requireRole(['recruiter']), async (req, res) => {
  try {
    const { search, university, major, minScore = 0 } = req.query;
    
    // Build search query
    const searchQuery = {};
    if (search) {
      searchQuery.$or = [
        { 'name': { $regex: search, $options: 'i' } },
        { 'email': { $regex: search, $options: 'i' } }
      ];
    }
    if (university) {
      searchQuery.university = { $regex: university, $options: 'i' };
    }
    if (major) {
      searchQuery.major = { $regex: major, $options: 'i' };
    }
    
    // Get students with resumes
    const students = await User.find({
      role: 'student',
      resumeId: { $exists: true },
      ...searchQuery
    })
    .populate('resumeId')
    .select('name email university major graduationYear resumeId');
    
    const candidates = students
      .filter(student => student.resumeId && student.resumeId.processingStatus === 'completed')
      .map(student => ({
        studentId: student._id,
        name: student.name,
        email: student.email,
        university: student.university,
        major: student.major,
        graduationYear: student.graduationYear,
        resumeId: student.resumeId._id,
        uploadedAt: student.resumeId.createdAt,
        skills: student.resumeId.parsedData?.skills?.map(s => s.name) || []
      }));
    
    res.json({
      candidates,
      total: candidates.length
    });
  } catch (error) {
    console.error('Get candidates overview error:', error);
    res.status(500).json({ message: 'Failed to fetch candidates overview' });
  }
});

// Get resume scores for student dashboard
router.get('/my/scores', authenticateJWT, requireRole(['student']), async (req, res) => {
  try {
    const resume = await Resume.findOne({ student: req.user._id })
      .populate({
        path: 'jobScores.jobId',
        select: 'title company location jobType scoreThreshold createdAt'
      });
    
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }
    
    // Filter out null job references and sort by score
    const validScores = resume.jobScores
      .filter(score => score.jobId)
      .sort((a, b) => b.score - a.score);
    
    res.json({
      resumeId: resume._id,
      processingStatus: resume.processingStatus,
      totalJobs: validScores.length,
      averageScore: validScores.length > 0 ? 
        Math.round(validScores.reduce((sum, score) => sum + score.score, 0) / validScores.length) : 0,
      scores: validScores.map(score => ({
        job: score.jobId,
        score: score.score,
        skillMatches: score.skillMatches,
        calculatedAt: score.calculatedAt,
        meetsThreshold: score.score >= score.jobId.scoreThreshold
      }))
    });
  } catch (error) {
    console.error('Get my scores error:', error);
    res.status(500).json({ message: 'Failed to fetch your scores' });
  }
});

export default router;