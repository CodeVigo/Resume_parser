import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  // Parsed data from Sovren API
  parsedData: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      address: String
    },
    skills: [{
      name: String,
      level: String,
      yearsOfExperience: Number
    }],
    education: [{
      degree: String,
      institution: String,
      graduationDate: Date,
      gpa: Number
    }],
    experience: [{
      title: String,
      company: String,
      startDate: Date,
      endDate: Date,
      description: String
    }],
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date
    }]
  },
  // Job matching scores
  jobScores: [{
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    skillMatches: [{
      skill: String,
      matched: Boolean,
      weight: Number
    }],
    calculatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // API processing status
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  errorMessage: String,
  lastProcessed: Date
}, {
  timestamps: true
});

resumeSchema.index({ student: 1 });
resumeSchema.index({ processingStatus: 1 });
resumeSchema.index({ 'jobScores.jobId': 1, 'jobScores.score': -1 });

export default mongoose.model('Resume', resumeSchema);