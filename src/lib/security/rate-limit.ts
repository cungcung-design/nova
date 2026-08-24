import { redis } from "@/lib/cache/redis";

type RateLimitResult = {
  success: boolean;
  remaining: number;
};

export async function rateLimit(
  key: string,
  limit = 60,
  windowSeconds = 60,
  options: { failOpen?: boolean } = {},
): Promise<RateLimitResult> {
  const failOpen = options.failOpen ?? true;

  try {
    const redisKey = `rate-limit:${key}`;
    const count = await redis.incr(redisKey);

    if (count === 1) {
      await redis.expire(redisKey, windowSeconds);
    }

    return {
      success: count <= limit,
      remaining: Math.max(limit - count, 0),
    };
  } catch (error) {
    console.error("Rate limit error:", error);

    if (failOpen) {
      return {
        success: true,
        remaining: limit,
      };
    }

    return {
      success: false,
      remaining: 0,
    };
  }
}

export function rateLimitResponse(message: string) {
  return Response.json(
    {
      message,
      error: message,
    },
    {
      status: 429,
    },
  );
}
