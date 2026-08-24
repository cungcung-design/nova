"use client";

import {
  createContext,
  useContext,
} from "react";

type Workspace = {
  id: string;
  name: string;
  role: string;
};

type WorkspaceContextValue = {
  workspaces: Workspace[];

  activeWorkspaceId: string;
};

const WorkspaceContext =
  createContext<
    WorkspaceContextValue | undefined
  >(undefined);

export function WorkspaceProvider({
  children,
  workspaces,
  activeWorkspaceId,
}: {
  children: React.ReactNode;

  workspaces: Workspace[];

  activeWorkspaceId: string;
}) {
  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspaceId,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context =
    useContext(
      WorkspaceContext,
    );

  if (!context) {
    throw new Error(
      "useWorkspace must be used inside WorkspaceProvider.",
    );
  }

  return context;
}