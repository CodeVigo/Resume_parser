// backend/services/scoringService.js
import { cacheService } from "./redisClient.js";

class ScoringService {
  // Pure computation of score
  async _computeScore(resumeData, job) {
    const resumeSkills = resumeData.parsedData.skills.map((s) =>
      s.name.toLowerCase().trim()
    );
    let totalScore = 0;
    let totalWeight = 0;
    const skillMatches = [];

    for (const { skill, weight } of job.requiredSkills) {
      const name = skill.toLowerCase().trim();
      const matched = resumeSkills.some(
        (rs) => rs.includes(name) || name.includes(rs)
      );
      skillMatches.push({ skill, matched, weight });
      if (matched) totalScore += weight * 10;
      totalWeight += weight * 10;
    }

    let finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;

    // Calculate and add bonus factors
    const bonus = this.calculateBonusFactors(resumeData.parsedData, job);
    finalScore = Math.min(100, Math.max(0, finalScore + bonus));

    return {
      score: Math.round(finalScore),
      skillMatches,
      bonusFactors: bonus,
      calculatedAt: new Date(),
    };
  }

  // Public API: uses cache first
  async calculateJobMatchScore(resumeData, job) {
    const resumeId = resumeData.resumeId.toString();
    const jobId = job._id.toString();

    // 1. Try cache
    const cached = await cacheService.getCachedJobScores(resumeId, jobId);
    if (cached) {
      return cached;
    }

    // 2. Compute on cache miss
    const computed = await this._computeScore(resumeData, job);

    // 3. Store result in cache (1 hour)
    await cacheService.cacheJobScores(resumeId, jobId, computed);

    return computed;
  }

  // Bonus scoring factors unchanged
  calculateBonusFactors(parsedData, job) {
    let bonus = 0;
    // Education
    if (parsedData.education && parsedData.education.length > 0) {
      const hasDegree = parsedData.education.some((edu) =>
        /computer|engineering|technology/i.test(edu.degree)
      );
      if (hasDegree) bonus += 5;
    }
    // Experience
    if (parsedData.experience && parsedData.experience.length > 0) {
      const count = parsedData.experience.filter((exp) =>
        /developer|engineer|intern/i.test(exp.title)
      ).length;
      bonus += Math.min(10, count * 3);
    }
    // Certifications
    if (parsedData.certifications && parsedData.certifications.length > 0) {
      bonus += Math.min(5, parsedData.certifications.length * 2);
    }
    // Recent grads for internships
    if (job.jobType === "internship") {
      const recentGrad = parsedData.education.some((edu) => {
        const diffYears =
          (new Date() - new Date(edu.graduationDate)) /
          (1000 * 60 * 60 * 24 * 365);
        return diffYears <= 2;
      });
      if (recentGrad) bonus += 5;
    }
    return bonus;
  }
}

export default new ScoringService();
