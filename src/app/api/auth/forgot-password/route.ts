import { NextResponse } from "next/server";

import { issuePasswordReset } from "@/lib/auth/password-reset";
import { appBaseUrl, sendMail } from "@/lib/mail";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/security";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { parseRequestBody } from "@/lib/validation/parse";

const GENERIC_MESSAGE =
  "If an account exists for that email, a reset link has been sent.";

export async function POST(request: Request) {
  try {
    const ipLimit = await rateLimit(
      `forgot:${getClientIp(request)}`,
      5,
      60 * 15,
      { failOpen: false },
    );

    if (!ipLimit.success) {
      return rateLimitResponse(
        "Too many reset requests. Please try again later.",
      );
    }

    const parsed = await parseRequestBody(request, forgotPasswordSchema);

    if (!parsed.success) {
      return parsed.response;
    }

    const email = parsed.data.email.trim().toLowerCase();

    const emailLimit = await rateLimit(`forgot-email:${email}`, 3, 60 * 60, {
      failOpen: false,
    });

    if (!emailLimit.success) {
      return rateLimitResponse(
        "Too many reset requests. Please try again later.",
      );
    }

    const issued = await issuePasswordReset(email);
    const payload: { message: string; resetUrl?: string } = {
      message: GENERIC_MESSAGE,
    };

    if (issued) {
      const resetUrl = `${appBaseUrl()}/reset-password?token=${issued.rawToken}`;

      await sendMail({
        to: issued.email,
        subject: "Reset your NOVA password",
        text: `Reset your password using this link (valid for 1 hour):\n${resetUrl}`,
        html: `<p>Reset your password using this link (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      });

      if (process.env.NODE_ENV !== "production") {
        payload.resetUrl = resetUrl;
      }
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }
}
