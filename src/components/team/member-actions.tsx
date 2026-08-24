"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

type Props = {
  memberId: string;
  currentRole: string;
  canChangeRole: boolean;
  canRemove: boolean;
};

export function MemberActions({
  memberId,
  currentRole,
  canChangeRole,
  canRemove,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function changeRole(role: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/team/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update role.");
      }

      window.location.reload();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update role.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    const confirmed = window.confirm(
      "Remove this member from the workspace?",
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/team/${memberId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to remove member.");
      }

      window.location.reload();
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove member.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (currentRole === "OWNER") {
    return (
      <span className="rounded-full border px-3 py-1 text-xs font-medium">
        Owner
      </span>
    );
  }

  if (!canChangeRole && !canRemove) {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {canChangeRole ? (
          <select
            disabled={loading}
            defaultValue={currentRole}
            onChange={(event) => {
              void changeRole(event.target.value);
            }}
            className="h-11 rounded-lg border bg-background px-2 text-xs"
            aria-label="Member role"
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        ) : null}

        {canRemove ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              void remove();
            }}
            className="flex h-11 w-11 items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
            aria-label="Remove member"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
