"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { isNavItemVisible, mainNavigation } from "@/config/navigation";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";

type MobileNavProps = {
  role: string;
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

export function MobileNav({
  role,
  currentWorkspace,
  workspaces,
}: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-lg border"
        aria-label="Open navigation"
        aria-expanded={open}
      >
        <Menu className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(18rem,calc(100vw-1.5rem))] flex-col overflow-y-auto bg-background p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">Menu</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-lg border"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5">
              <WorkspaceSwitcher
                workspaces={workspaces}
                activeWorkspaceId={currentWorkspace.id}
              />
            </div>

            {mainNavigation.map((section) => (
              <div key={section.title} className="mb-5">
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items
                    .filter((item) => isNavItemVisible(item.href, role))
                    .map((item) => {
                      const Icon = item.icon;
                      const active =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                            active
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:bg-muted/60",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {item.title}
                        </Link>
                      );
                    })}
                </div>
              </div>
            ))}

            <div className="mt-auto border-t pt-3">
              <p className="px-3 text-xs font-semibold">
                {currentWorkspace.plan} Plan
              </p>
              <p className="mt-1 px-3 text-xs text-muted-foreground">
                {currentWorkspace.role}
              </p>
              <button
                type="button"
                onClick={() => {
                  void signOut({ callbackUrl: "/login" });
                }}
                className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
