const Redis = require('ioredis');

let redisClient = null;
const useRedis = !!process.env.REDIS_URL;

// Local Memory Cache Fallback
const memoryCache = new Map();
const memoryExpiry = new Map();

if (useRedis) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1
    });
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
      console.log('Redis error occurred. Falling back to local memory cache.');
      redisClient.disconnect();
      redisClient = null;
    });
    console.log('Redis cache client initialized.');
  } catch (err) {
    console.error('Failed to initialize Redis, using local memory cache.', err);
  }
} else {
  console.log('Redis URL not configured. Using local in-memory cache.');
}

// Clean up expired items from memory cache in background
setInterval(() => {
  const now = Date.now();
  for (const [key, expiry] of memoryExpiry.entries()) {
    if (now > expiry) {
      memoryCache.delete(key);
      memoryExpiry.delete(key);
    }
  }
}, 10000).unref(); // don't block process exit

const cache = {
  async get(key) {
    if (useRedis && redisClient) {
      try {
        const val = await redisClient.get(key);
        return val ? JSON.parse(val) : null;
      } catch (err) {
        console.error('Redis get error:', err);
      }
    }
    
    // Memory get
    const now = Date.now();
    const expiry = memoryExpiry.get(key);
    if (expiry && now > expiry) {
      memoryCache.delete(key);
      memoryExpiry.delete(key);
      return null;
    }
    return memoryCache.get(key) || null;
  },

  async set(key, value, expireSeconds = 3600) {
    if (useRedis && redisClient) {
      try {
        await redisClient.set(key, JSON.stringify(value), 'EX', expireSeconds);
        return true;
      } catch (err) {
        console.error('Redis set error:', err);
      }
    }

    // Memory set
    memoryCache.set(key, value);
    if (expireSeconds) {
      memoryExpiry.set(key, Date.now() + (expireSeconds * 1000));
    }
    return true;
  },

  async del(key) {
    if (useRedis && redisClient) {
      try {
        await redisClient.del(key);
        return true;
      } catch (err) {
        console.error('Redis del error:', err);
      }
    }
    memoryCache.delete(key);
    memoryExpiry.delete(key);
    return true;
  }
};

module.exports = cache;
