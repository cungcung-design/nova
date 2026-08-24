"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type WorkspaceSettingsFormProps = {
  name: string;
  plan: string;
  role: string;
  canEdit: boolean;
};

export function WorkspaceSettingsForm({
  name,
  plan,
  role,
  canEdit,
}: WorkspaceSettingsFormProps) {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState(name);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/workspaces", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? data.error ?? "Unable to save settings.");
      }

      setMessage("Workspace name updated.");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Workspace</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Current plan: {plan} · Your role: {role}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="workspace-name" className="text-sm font-medium">
              Workspace name
            </label>
            <input
              id="workspace-name"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              disabled={!canEdit || saving}
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm disabled:opacity-60"
            />
          </div>

          {canEdit ? (
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-xl bg-foreground px-4 text-sm font-medium text-background disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Only owners and admins can rename this workspace.
            </p>
          )}

          {message ? (
            <p className="text-sm text-muted-foreground">{message}</p>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </form>
      </section>
    </div>
  );
}
