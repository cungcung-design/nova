export function sanitizeSearchQuery(value: string) {
  return value.trim().slice(0, 100);
}

export function isSafeRedirect(value: string) {
  if (!value) {
    return false;
  }

  return value.startsWith("/") && !value.startsWith("//");
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}
