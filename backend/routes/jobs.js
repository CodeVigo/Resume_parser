import express from 'express';
import Job from '../models/Job.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all active jobs (for students)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, jobType, location } = req.query;
    
    const query = { isActive: true };
    
    // Search filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (jobType) {
      query.jobType = jobType;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    const jobs = await Job.find(query)
      .populate('recruiter', 'name company')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Job.countDocuments(query);
    
    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// Get job by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', 'name company email');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Failed to fetch job' });
  }
});

// Create new job (recruiters only)
router.post('/', authenticateJWT, requireRole(['recruiter']), async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      requirements,
      location,
      salary,
      jobType,
      requiredSkills,
      scoreThreshold,
      deadlineDate
    } = req.body;
    
    // Validation
    if (!title || !company || !description || !requirements || !location) {
      return res.status(400).json({
        message: 'Title, company, description, requirements, and location are required'
      });
    }
    
    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({
        message: 'At least one required skill must be specified'
      });
    }
    
    const job = new Job({
      title,
      company,
      description,
      requirements,
      location,
      salary,
      jobType: jobType || 'full-time',
      requiredSkills,
      scoreThreshold: scoreThreshold || 60,
      recruiter: req.user._id,
      deadlineDate: deadlineDate ? new Date(deadlineDate) : null
    });
    
    await job.save();
    
    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Failed to create job' });
  }
});

// Update job (recruiters only, own jobs)
router.put('/:id', authenticateJWT, requireRole(['recruiter']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if user owns this job
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }
    
    const updates = req.body;
    Object.assign(job, updates);
    
    await job.save();
    
    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Failed to update job' });
  }
});

// Delete job (recruiters only, own jobs)
router.delete('/:id', authenticateJWT, requireRole(['recruiter']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if user owns this job
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }
    
    await Job.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Failed to delete job' });
  }
});

// Get recruiter's jobs
router.get('/my/jobs', authenticateJWT, requireRole(['recruiter']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const jobs = await Job.find({ recruiter: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Job.countDocuments({ recruiter: req.user._id });
    
    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ message: 'Failed to fetch your jobs' });
  }
});

export default router;