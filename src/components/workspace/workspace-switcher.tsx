"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { DropdownMenu, useDropdown } from "@/components/ui/dropdown-menu";

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
  const menu = useDropdown();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const active =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ??
    workspaces[0];

  async function switchWorkspace(workspaceId: string) {
    if (workspaceId === activeWorkspaceId) {
      menu.close();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/workspaces/switch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to switch workspace.");
      }

      menu.close();
      router.refresh();
    } catch (switchError) {
      setError(
        switchError instanceof Error
          ? switchError.message
          : "Unable to switch workspace.",
      );
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
        {...menu.triggerProps}
        disabled={loading}
        className="flex min-h-11 w-full items-center gap-3 rounded-xl border bg-card p-2.5 text-left transition hover:bg-muted disabled:opacity-60"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background">
          {active.name.slice(0, 1).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{active.name}</p>
          <p className="truncate text-xs text-muted-foreground">{active.role}</p>
        </div>

        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      <DropdownMenu
        open={menu.open}
        onClose={menu.close}
        triggerRef={menu.triggerRef}
        align="start"
        labelledBy={menu.triggerId}
        className="w-[min(18rem,calc(100vw-2rem))] p-1.5"
      >
        <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
          Switch workspace
        </div>

        {workspaces.map((workspace) => {
          const selected = workspace.id === activeWorkspaceId;

          return (
            <button
              key={workspace.id}
              type="button"
              role="menuitem"
              onClick={() => {
                void switchWorkspace(workspace.id);
              }}
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold">
                {workspace.name.slice(0, 1).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{workspace.name}</p>
                <p className="text-xs text-muted-foreground">{workspace.role}</p>
              </div>

              {selected ? <Check className="h-4 w-4 shrink-0" /> : null}
            </button>
          );
        })}

        {error ? (
          <p className="px-3 py-2 text-xs text-destructive">{error}</p>
        ) : null}
      </DropdownMenu>
    </div>
  );
}
