import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { getClientIp, isSafeRedirect } from "@/lib/security/security";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    request.method === "POST" &&
    pathname === "/api/auth/callback/credentials"
  ) {
    const result = await rateLimit(`login:${getClientIp(request)}`, 10, 60);

    if (!result.success) {
      return rateLimitResponse(
        "Too many login attempts. Please try again later.",
      );
    }

    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
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
  matcher: ["/dashboard/:path*", "/api/auth/callback/credentials"],
};
