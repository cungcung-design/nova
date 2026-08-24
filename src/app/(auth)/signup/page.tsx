"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    const response = await fetch(
      "/api/auth/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Unable to create account.");
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <main className="auth-page">
      <div className="w-full max-w-sm">
        <div className="auth-card">
          <div className="auth-badge">N</div>

          <h1 className="auth-title">
            Create your NOVA account
          </h1>
          <p className="auth-subtitle">
            Start building your workspace today.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-3"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-medium text-muted-foreground"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                className="auth-input"
              />
            </div>

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
                placeholder="Min. 8 characters"
                minLength={8}
                required
                className="auth-input"
              />
            </div>

            {error && (
              <div className="auth-error">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link
              href="/login"
              className="auth-footer-link"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
