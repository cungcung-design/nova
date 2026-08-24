import { NextResponse } from "next/server";

const SAFE_CLIENT_ERRORS = new Set([
  "Customer not found.",
  "Product not found.",
  "One or more products were not found.",
  "Invalid invitation.",
  "This invitation has expired.",
  "This invitation was sent to a different email address.",
  "This user is already a member of the workspace.",
  "An invitation has already been sent to this email.",
  "Member not found.",
  "Workspace subscription not found.",
  "This feature requires a higher subscription plan.",
]);

function isSafeClientError(message: string) {
  if (SAFE_CLIENT_ERRORS.has(message)) {
    return true;
  }

  return message.endsWith("does not have enough stock.");
}

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

  if (message && isSafeClientError(message)) {
    return NextResponse.json({ error: message, message }, { status: 400 });
  }

  console.error("Internal error:", error);

  return NextResponse.json(
    { error: fallback, message: fallback },
    { status: 500 },
  );
}
