"use client";

import { ChevronsUpDown, Plus } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Workspace = {
  id: string;
  name: string;
  plan: string;
};

type WorkspaceSwitcherProps = {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
};

export function WorkspaceSwitcher({
  currentWorkspace,
  workspaces,
}: WorkspaceSwitcherProps) {
  async function switchWorkspace(
    workspaceId: string,
  ) {
    await fetch("/api/workspaces/switch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workspaceId,
      }),
    });

    window.location.reload();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-muted">
          <Avatar className="h-9 w-9 rounded-lg">
            <AvatarFallback className="rounded-lg">
              {currentWorkspace.name
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {currentWorkspace.name}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {currentWorkspace.plan} Workspace
            </p>
          </div>

          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-64"
      >
        <DropdownMenuLabel>
          Workspaces
        </DropdownMenuLabel>

        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() =>
              switchWorkspace(workspace.id)
            }
          >
            {workspace.name}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Plus className="mr-2 h-4 w-4" />
          Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
