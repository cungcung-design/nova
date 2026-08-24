"use client";

import { useRouter } from "next/navigation";

import { Check, ChevronsUpDown } from "lucide-react";

import { useState } from "react";

type Workspace = {
  id: string;
  name: string;
  role: string;
};

type Props = {
  workspaces: Workspace[];

  activeWorkspaceId: string;
};

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const active =
    workspaces.find(
      (workspace) =>
        workspace.id ===
        activeWorkspaceId,
    ) ??
    workspaces[0];

  async function switchWorkspace(
    workspaceId: string,
  ) {
    if (
      workspaceId ===
      activeWorkspaceId
    ) {
      setOpen(false);
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/workspaces/switch",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              workspaceId,
            }),
          },
        );

      if (!response.ok) {
        throw new Error(
          "Unable to switch workspace.",
        );
      }

      setOpen(false);

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (!active) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={loading}
        onClick={() =>
          setOpen((value) => !value)
        }
        className="flex w-full items-center gap-3 rounded-xl border bg-card p-2.5 text-left transition hover:bg-muted"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background">
          {active.name
            .slice(0, 1)
            .toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {active.name}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            {active.role}
          </p>
        </div>

        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close workspace menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() =>
              setOpen(false)
            }
          />

          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-card p-1.5 shadow-xl">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
              Switch workspace
            </div>

            {workspaces.map(
              (workspace) => {
                const selected =
                  workspace.id ===
                  activeWorkspaceId;

                return (
                  <button
                    key={workspace.id}
                    type="button"
                    onClick={() =>
                      switchWorkspace(
                        workspace.id,
                      )
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold">
                      {workspace.name
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {workspace.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {workspace.role}
                      </p>
                    </div>

                    {selected && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                );
              },
            )}
          </div>
        </>
      )}
    </div>
  );
}