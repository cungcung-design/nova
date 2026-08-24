"use client";

import { useState } from "react";

import { Trash2 } from "lucide-react";

type Props = {
  memberId: string;

  currentRole: string;
};

export function MemberActions({
  memberId,
  currentRole,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  async function changeRole(
    role: string,
  ) {
    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/team/${memberId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              role,
            }),
          },
        );

      if (!response.ok) {
        throw new Error(
          "Unable to update role.",
        );
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    const confirmed =
      window.confirm(
        "Remove this member from the workspace?",
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/team/${memberId}`,
          {
            method: "DELETE",
          },
        );

      if (!response.ok) {
        throw new Error(
          "Unable to remove member.",
        );
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
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

  return (
    <div className="flex items-center gap-2">
      <select
        disabled={loading}
        defaultValue={currentRole}
        onChange={(event) =>
          changeRole(
            event.target.value,
          )
        }
        className="rounded-lg border bg-background px-2 py-1.5 text-xs"
      >
        <option value="MEMBER">
          Member
        </option>

        <option value="ADMIN">
          Admin
        </option>
      </select>

      <button
        type="button"
        disabled={loading}
        onClick={remove}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
        aria-label="Remove member"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}