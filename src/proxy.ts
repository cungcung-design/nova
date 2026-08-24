import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import {
  getClientIp,
  isPublicApiPath,
  isSafeRedirect,
  isSameOriginRequest,
} from "@/lib/security/security";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    MUTATING_METHODS.has(request.method) &&
    pathname.startsWith("/api/") &&
    !isPublicApiPath(pathname) &&
    !isSameOriginRequest(request)
  ) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (
    request.method === "POST" &&
    pathname === "/api/auth/callback/credentials"
  ) {
    const result = await rateLimit(`login:${getClientIp(request)}`, 10, 60, {
      failOpen: false,
    });

    if (!result.success) {
      return rateLimitResponse(
        "Too many login attempts. Please try again later.",
      );
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

  const token = await getToken({
    req: request,
    secret,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set(
      "callbackUrl",
      isSafeRedirect(nextPath) ? nextPath : "/dashboard",
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
