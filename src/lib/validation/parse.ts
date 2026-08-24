import type { z } from "zod";

export async function parseRequestBody<TSchema extends z.ZodType>(
  request: Request,
  schema: TSchema,
) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      success: false as const,
      response: Response.json(
        {
          message: "Invalid request.",
          error: "Invalid request.",
        },
        { status: 400 },
      ),
    };
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return {
      success: false as const,
      response: Response.json(
        {
          message: "Invalid request.",
          error: "Invalid request.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      ),
    };
  }

  return {
    success: true as const,
    data: parsed.data as z.infer<TSchema>,
  };
}
