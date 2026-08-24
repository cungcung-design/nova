"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthLogo } from "@/components/auth/auth-logo";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    token ? "" : "This reset link is missing a token.",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("This reset link is missing a token.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "Unable to reset password.");
        setLoading(false);
        return;
      }

      router.push("/login?reset=true");
    } catch {
      setError("Unable to reset password. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <AuthLogo />
      <h1 className="auth-title">Choose a new password</h1>
      <p className="auth-subtitle">Use at least 8 characters.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-medium text-muted-foreground"
          >
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
            className="auth-input"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirm"
            className="text-xs font-medium text-muted-foreground"
          >
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            minLength={8}
            required
            className="auth-input"
          />
        </div>

        {error ? <div className="auth-error">{error}</div> : null}

        <button
          type="submit"
          disabled={loading || !token}
          className="auth-button"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>

      <p className="auth-footer">
        <Link href="/login" className="auth-footer-link">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="auth-page">
      <div className="w-full max-w-sm">
        <Suspense
          fallback={
            <div className="auth-card">
              <AuthLogo />
              <div className="mt-6 h-8 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
