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

export function isSameOriginRequest(request: Request) {
  const host = request.headers.get("host");

  if (!host) {
    return false;
  }

  const origin = request.headers.get("origin");

  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get("referer");

  if (!referer) {
    return false;
  }

  try {
    return new URL(referer).host === host;
  } catch {
    return false;
  }
}

export function isPublicApiPath(pathname: string) {
  return (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhooks") ||
    pathname === "/api/health"
  );
}
