"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { AuthLogo } from "@/components/auth/auth-logo";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setResetUrl("");

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.get("email") }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? data.message ?? "Unable to send reset link.");
        setLoading(false);
        return;
      }

      setMessage(
        data.message ??
          "If an account exists for that email, a reset link has been sent.",
      );
      if (typeof data.resetUrl === "string") {
        setResetUrl(data.resetUrl);
      }
    } catch {
      setError("Unable to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="w-full max-w-sm">
        <div className="auth-card">
          <AuthLogo />
          <h1 className="auth-title">Reset your password</h1>
          <p className="auth-subtitle">
            Enter your email and we&apos;ll send a reset link if an account exists.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-muted-foreground"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="auth-input"
              />
            </div>

            {error ? <div className="auth-error">{error}</div> : null}
            {message ? <div className="auth-success">{message}</div> : null}
            {resetUrl ? (
              <p className="break-all text-xs text-muted-foreground">
                Development link:{" "}
                <Link href={resetUrl} className="auth-footer-link">
                  {resetUrl}
                </Link>
              </p>
            ) : null}

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="auth-footer">
            Remembered it?{" "}
            <Link href="/login" className="auth-footer-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
