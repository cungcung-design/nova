"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    token?: string;
    expiresAt: Date;
    createdAt: Date;
  }>;
  canCancel: boolean;
};

export function PendingInvitations({ invitations, canCancel }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function cancel(invitationId: string) {
    const confirmed = window.confirm("Cancel this invitation?");

    if (!confirmed) {
      return;
    }

    setPendingId(invitationId);
    setError("");

    try {
      const response = await fetch(`/api/team/invitations/${invitationId}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to cancel invitation.");
      }

      router.refresh();
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "Unable to cancel invitation.",
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-6 py-5">
        <h2 className="font-semibold">Pending Invitations</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Invitations that have not been accepted yet.
        </p>
      </div>

      {invitations.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          No pending invitations.
        </div>
      ) : (
        <div className="divide-y">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="break-all font-medium">{invitation.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sent {invitation.createdAt.toISOString().split("T")[0]}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border px-3 py-1 text-xs">
                  {invitation.role}
                </span>
                <span className="text-xs text-muted-foreground">
                  Expires {invitation.expiresAt.toISOString().split("T")[0]}
                </span>
                {canCancel ? (
                  <button
                    type="button"
                    disabled={pendingId === invitation.id}
                    onClick={() => {
                      void cancel(invitation.id);
                    }}
                    className="h-11 rounded-lg border px-3 text-sm font-medium hover:bg-muted disabled:opacity-50"
                  >
                    {pendingId === invitation.id ? "Cancelling..." : "Cancel"}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {error ? (
        <p className="px-6 py-3 text-sm text-destructive">{error}</p>
      ) : null}
    </section>
  );
}
