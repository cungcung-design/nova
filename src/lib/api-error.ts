import { NextResponse } from "next/server";

export function apiErrorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : "";

  if (message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (
    message === "FORBIDDEN" ||
    message === "Insufficient workspace permissions." ||
    message === "Workspace membership required."
  ) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (message === "NO_WORKSPACE") {
    return NextResponse.json({ error: "No workspace found." }, { status: 404 });
  }

  if (message === "PLAN_LIMIT") {
    return NextResponse.json(
      { error: "Plan limit reached. Upgrade to continue." },
      { status: 402 },
    );
  }

  if (message === "RATE_LIMITED") {
    return NextResponse.json(
      {
        message: "Too many requests. Please try again later.",
        error: "Too many requests. Please try again later.",
      },
      { status: 429 },
    );
  }

  console.error("Internal error:", error);

  return NextResponse.json({ error: fallback, message: fallback }, { status: 500 });
}
