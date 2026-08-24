"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function accept() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/invitations/${token}`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to accept invitation.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to accept invitation.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <button
        type="button"
        onClick={accept}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background disabled:opacity-60"
      >
        {loading ? "Joining..." : "Accept invitation"}
      </button>
    </div>
  );
}
