"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { mainNavigation } from "@/config/navigation";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";

type AppSidebarProps = {
  currentWorkspace: {
    id: string;
    name: string;
    plan: string;
    role: string;
  };

  workspaces: {
    id: string;
    name: string;
    role: string;
  }[];
};

export function AppSidebar({
  currentWorkspace,
  workspaces,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r bg-background lg:flex lg:flex-col">
      <div className="flex h-16 items-center px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-sm font-bold text-background">
            N
          </div>

          <span className="text-lg font-bold tracking-tight">
            NOVA
          </span>
        </Link>
      </div>

      <div className="px-3 py-3">
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeWorkspaceId={currentWorkspace.id}
        />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {mainNavigation.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;

                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />

                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-xs font-semibold">
            {currentWorkspace.plan} Plan
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {currentWorkspace.role}
          </p>
        </div>
      </div>
    </aside>
  );
}