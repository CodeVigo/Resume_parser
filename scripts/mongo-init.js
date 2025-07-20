// MongoDB initialization script
db = db.getSiblingDB('campusRecruitment');

// Create collections
db.createCollection('users');
db.createCollection('jobs');
db.createCollection('resumes');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ googleId: 1 }, { sparse: true });
db.users.createIndex({ role: 1 });

db.jobs.createIndex({ recruiter: 1 });
db.jobs.createIndex({ isActive: 1 });
db.jobs.createIndex({ createdAt: -1 });
db.jobs.createIndex({ 'requiredSkills.skill': 1 });

db.resumes.createIndex({ student: 1 });
db.resumes.createIndex({ processingStatus: 1 });
db.resumes.createIndex({ 'jobScores.jobId': 1, 'jobScores.score': -1 });

print('Database initialized successfully');