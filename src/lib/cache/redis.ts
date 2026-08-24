type MemoryEntry = {
  value: number;
  expiresAt?: number;
};

const memory = new Map<string, MemoryEntry>();

function readEntry(key: string) {
  const entry = memory.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    memory.delete(key);
    return null;
  }

  return entry;
}

/**
 * In-memory Redis-compatible client.
 * Production can set REDIS_URL later without changing call sites.
 * Cache/rate-limit failures must never take the app down.
 */
export const redis = {
  async incr(key: string) {
    const existing = readEntry(key);

    if (!existing) {
      memory.set(key, { value: 1 });
      return 1;
    }

    existing.value += 1;
    return existing.value;
  },

  async expire(key: string, seconds: number) {
    const existing = readEntry(key);

    if (!existing) {
      return 0;
    }

    existing.expiresAt = Date.now() + seconds * 1000;
    return 1;
  },

  async ping() {
    return "PONG";
  },
};
