import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'contract'],
    default: 'full-time'
  },
  requiredSkills: [{
    skill: {
      type: String,
      required: true,
      trim: true
    },
    weight: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    }
  }],
  scoreThreshold: {
    type: Number,
    min: 0,
    max: 100,
    default: 60
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  deadlineDate: {
    type: Date
  }
}, {
  timestamps: true
});

jobSchema.index({ recruiter: 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ 'requiredSkills.skill': 1 });

export default mongoose.model('Job', jobSchema);