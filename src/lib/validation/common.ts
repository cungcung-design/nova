import { z } from "zod";

export const idSchema = z.string().min(1).max(100);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export function parseIdList(value: unknown, max = 100) {
  if (!Array.isArray(value)) {
    return { ok: false as const, error: "No IDs provided." };
  }

  const ids = Array.from(
    new Set(
      value.filter(
        (id): id is string => typeof id === "string" && id.length > 0,
      ),
    ),
  );

  if (ids.length === 0) {
    return { ok: false as const, error: "No IDs provided." };
  }

  if (ids.length > max) {
    return {
      ok: false as const,
      error: `You can process at most ${max} items at once.`,
    };
  }

  return { ok: true as const, ids };
}
