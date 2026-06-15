import Redis from 'ioredis';
import { config } from './index.js';

let redis: Redis | null = null;
let subscriber: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });
    redis.on('error', () => {});
  }
  return redis;
}

export function getSubscriber(): Redis {
  if (!subscriber) {
    subscriber = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: 3,
    });
  }
  return subscriber;
}

export async function closeRedis(): Promise<void> {
  if (redis) { await redis.quit(); redis = null; }
  if (subscriber) { await subscriber.quit(); subscriber = null; }
}
