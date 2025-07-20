import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  lazyConnect: true,
  maxRetriesPerRequest: null
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export const cacheService = {
  // Cache parsed resume data
  async cacheResumeData(resumeId, data, expiry = 86400) { // 24 hours
    try {
      await redis.setex(`resume:${resumeId}`, expiry, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },
  
  // Get cached resume data
  async getCachedResumeData(resumeId) {
    try {
      const data = await redis.get(`resume:${resumeId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },
  
  // Cache job scores
  async cacheJobScores(resumeId, jobId, scores, expiry = 3600) { // 1 hour
    try {
      await redis.setex(`scores:${resumeId}:${jobId}`, expiry, JSON.stringify(scores));
    } catch (error) {
      console.error('Cache scores error:', error);
    }
  },
  
  // Get cached job scores
  async getCachedJobScores(resumeId, jobId) {
    try {
      const data = await redis.get(`scores:${resumeId}:${jobId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get scores error:', error);
      return null;
    }
  },
  
  // Clear cache for a resume
  async clearResumeCache(resumeId) {
    try {
      const keys = await redis.keys(`*${resumeId}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
};

export default redis;