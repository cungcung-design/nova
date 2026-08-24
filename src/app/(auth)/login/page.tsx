"use client";

import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    searchParams.get("error") ? "Invalid email or password." : "",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result || result.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push(result.url || callbackUrl);
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
      setLoading(false);
    }
  }

  const registered = searchParams.get("registered") === "true";

  return (
    <div className="auth-card">
      <div className="auth-badge">N</div>

      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-subtitle">
        Sign in to your NOVA workspace.
      </p>

      {registered && (
        <div className="auth-error">
          Account created successfully. You can now sign in.
        </div>
      )}

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

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-medium text-muted-foreground"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
            className="auth-input"
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="auth-footer">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="auth-footer-link">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="w-full max-w-sm">
        <Suspense
          fallback={
            <div className="auth-card">
              <div className="auth-badge">N</div>
              <div className="mt-6 h-8 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
