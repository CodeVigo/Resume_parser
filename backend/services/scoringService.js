import { cacheService } from './redisClient.js';

class ScoringService {
  // Calculate match score between resume and job
  async calculateJobMatchScore(resumeData, job) {
    try {
      // Check cache first
      const cachedScore = await cacheService.getCachedJobScores(
        resumeData.resumeId, 
        job._id
      );
      
      if (cachedScore) {
        return cachedScore;
      }
      
      const resumeSkills = resumeData.parsedData.skills.map(skill => 
        skill.name.toLowerCase().trim()
      );
      
      let totalScore = 0;
      let totalWeight = 0;
      const skillMatches = [];
      
      // Calculate skill-based scoring
      for (const requiredSkill of job.requiredSkills) {
        const skillName = requiredSkill.skill.toLowerCase().trim();
        const weight = requiredSkill.weight;
        const isMatched = resumeSkills.some(resumeSkill => 
          resumeSkill.includes(skillName) || skillName.includes(resumeSkill)
        );
        
        skillMatches.push({
          skill: requiredSkill.skill,
          matched: isMatched,
          weight: weight
        });
        
        if (isMatched) {
          totalScore += weight * 10; // Each matched skill worth up to 10 points * weight
        }
        
        totalWeight += weight * 10;
      }
      
      // Calculate base percentage
      let finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
      
      // Bonus scoring factors
      const bonusFactors = this.calculateBonusFactors(resumeData.parsedData, job);
      finalScore += bonusFactors;
      
      // Ensure score is between 0 and 100
      finalScore = Math.min(100, Math.max(0, finalScore));
      
      const result = {
        score: Math.round(finalScore),
        skillMatches,
        bonusFactors,
        calculatedAt: new Date()
      };
      
      // Cache the result
      await cacheService.cacheJobScores(resumeData.resumeId, job._id, result);
      
      return result;
    } catch (error) {
      console.error('Score calculation error:', error);
      return {
        score: 0,
        skillMatches: [],
        bonusFactors: 0,
        error: error.message,
        calculatedAt: new Date()
      };
    }
  }
  
  // Calculate bonus factors
  calculateBonusFactors(parsedData, job) {
    let bonus = 0;
    
    // Education bonus
    if (parsedData.education && parsedData.education.length > 0) {
      const hasRelevantDegree = parsedData.education.some(edu => 
        edu.degree.toLowerCase().includes('computer') ||
        edu.degree.toLowerCase().includes('engineering') ||
        edu.degree.toLowerCase().includes('technology')
      );
      if (hasRelevantDegree) bonus += 5;
    }
    
    // Experience bonus
    if (parsedData.experience && parsedData.experience.length > 0) {
      const relevantExperience = parsedData.experience.filter(exp => 
        exp.title.toLowerCase().includes('developer') ||
        exp.title.toLowerCase().includes('engineer') ||
        exp.title.toLowerCase().includes('intern')
      );
      bonus += Math.min(10, relevantExperience.length * 3);
    }
    
    // Certification bonus
    if (parsedData.certifications && parsedData.certifications.length > 0) {
      bonus += Math.min(5, parsedData.certifications.length * 2);
    }
    
    // Recent graduation bonus for internships
    if (job.jobType === 'internship' && parsedData.education.length > 0) {
      const recentGraduation = parsedData.education.some(edu => {
        const gradDate = new Date(edu.graduationDate);
        const now = new Date();
        const diffYears = (now - gradDate) / (1000 * 60 * 60 * 24 * 365);
        return diffYears <= 2;
      });
      if (recentGraduation) bonus += 5;
    }
    
    return bonus;
  }
  
  // Batch calculate scores for multiple jobs
  async calculateMultipleJobScores(resumeData, jobs) {
    const scores = [];
    
    for (const job of jobs) {
      const score = await this.calculateJobMatchScore(resumeData, job);
      scores.push({
        jobId: job._id,
        ...score
      });
    }
    
    return scores;
  }
}

export default new ScoringService();