"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Mail, UserPlus } from "lucide-react";

export function InviteMember() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("invite") === "true") {
      emailRef.current?.focus();
    }
  }, [searchParams]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to send invitation.");
      }

      setEmail("");
      const inviteUrl =
        (typeof data.inviteUrl === "string" && data.inviteUrl) ||
        (typeof data.invitation?.token === "string"
          ? `${window.location.origin}/invite/${data.invitation.token}`
          : "");
      setMessage(
        inviteUrl
          ? `Invitation created. Share this link: ${inviteUrl}`
          : "Invitation created successfully.",
      );
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border p-2.5">
          <UserPlus className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold">Invite team member</h2>
          <p className="text-sm text-muted-foreground">
            Give someone access to this workspace.
          </p>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="mt-6 grid gap-3 md:grid-cols-[1fr_160px_auto]"
      >
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={emailRef}
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@company.com"
            className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-foreground/10"
          />
        </div>

        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="h-11 rounded-xl border bg-background px-3 text-sm outline-none"
        >
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-xl bg-foreground px-5 text-sm font-medium text-background disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send invite"}
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      {message ? (
        <p className="mt-4 break-all text-sm text-muted-foreground">{message}</p>
      ) : null}
    </section>
  );
}
