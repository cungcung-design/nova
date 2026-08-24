import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { redis } from "@/lib/cache/redis";

export async function GET() {
  let database = "ok";
  let cache: "memory" | "redis" | "unavailable" = redis.backend;

  try {
    await db.$queryRaw`SELECT 1`;
  } catch (error) {
    database = "unavailable";
    console.error("Database health check failed:", error);
  }

  try {
    await redis.ping();
  } catch (error) {
    cache = "unavailable";
    console.error("Cache health check failed:", error);
  }

  const healthy = database === "ok";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "error",
      database,
      cache,
      timestamp: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
    },
  );
}
