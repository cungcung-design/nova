import net from "node:net";

type MemoryEntry = {
  value: number;
  expiresAt?: number;
};

type RedisBackend = "memory" | "redis";

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

function encodeCommand(args: string[]) {
  return `*${args.length}\r\n${args
    .map((arg) => {
      const size = Buffer.byteLength(arg);
      return `$${size}\r\n${arg}\r\n`;
    })
    .join("")}`;
}

function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname || "127.0.0.1",
    port: Number(parsed.port || 6379),
    password: decodeURIComponent(parsed.password || ""),
    db: parsed.pathname.replace("/", "") || "",
  };
}

function sendRedisCommand(command: string[]): Promise<string | number> {
  const url = process.env.REDIS_URL?.trim();

  if (!url) {
    return Promise.reject(new Error("REDIS_URL is not set"));
  }

  const config = parseRedisUrl(url);

  return new Promise((resolve, reject) => {
    const socket = net.createConnection({
      host: config.host,
      port: config.port,
    });
    socket.setTimeout(2000);

    let buffer = "";
    const queue: string[][] = [];

    if (config.password) {
      queue.push(["AUTH", config.password]);
    }

    if (config.db) {
      queue.push(["SELECT", config.db]);
    }

    queue.push(command);

    function fail(error: Error) {
      socket.destroy();
      reject(error);
    }

    socket.on("timeout", () => fail(new Error("Redis timeout")));
    socket.on("error", (error) => fail(error));
    socket.on("connect", () => {
      socket.write(queue.map(encodeCommand).join(""));
    });
    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      const replies = buffer.split("\r\n").filter(Boolean);

      if (replies.length < queue.length) {
        return;
      }

      const last = replies[replies.length - 1] ?? "";

      if (last.startsWith("-")) {
        fail(new Error(last.slice(1)));
        return;
      }

      socket.end();

      if (last.startsWith(":")) {
        resolve(Number(last.slice(1)));
        return;
      }

      if (last.startsWith("+")) {
        resolve(last.slice(1));
        return;
      }

      resolve(last);
    });
    socket.on("end", () => {
      if (!buffer) {
        reject(new Error("Redis closed the connection"));
      }
    });
  });
}

async function withRedis<T>(
  command: string[],
  fallback: () => Promise<T>,
): Promise<T> {
  if (!process.env.REDIS_URL?.trim()) {
    return fallback();
  }

  try {
    return (await sendRedisCommand(command)) as T;
  } catch (error) {
    console.error("Redis command failed:", error);
    return fallback();
  }
}

export const redis = {
  async incr(key: string) {
    return withRedis(["INCR", key], async () => {
      const existing = readEntry(key);

      if (!existing) {
        memory.set(key, { value: 1 });
        return 1;
      }

      existing.value += 1;
      return existing.value;
    });
  },

  async expire(key: string, seconds: number) {
    return withRedis(["EXPIRE", key, String(seconds)], async () => {
      const existing = readEntry(key);

      if (!existing) {
        return 0;
      }

      existing.expiresAt = Date.now() + seconds * 1000;
      return 1;
    });
  },

  async ping() {
    if (!process.env.REDIS_URL?.trim()) {
      return "PONG";
    }

    return sendRedisCommand(["PING"]);
  },

  get backend(): RedisBackend {
    return process.env.REDIS_URL?.trim() ? "redis" : "memory";
  },
};
