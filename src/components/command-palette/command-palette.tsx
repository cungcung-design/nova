"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Command as CommandIcon,
  Search,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  CreditCard,
  FileText,
  Bell,
  Plus,
  UserPlus,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";

type CommandItem = {
  id: string;
  title: string;
  description?: string;
  keywords?: string[];
  href?: string;
  icon: React.ElementType;
};

type CommandPaletteProps = {
  isAdmin: boolean;
};

type SearchResults = {
  customers: Array<{
    id: string;
    name: string;
    email: string | null;
  }>;

  products: Array<{
    id: string;
    name: string;
  }>;

  orders: Array<{
    id: string;
    status: string;
  }>;
};

export function CommandPalette({
  isAdmin,
}: CommandPaletteProps) {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const [activeIndex, setActiveIndex] = useState(0);

  const [searchResults, setSearchResults] =
    useState<SearchResults>({
      customers: [],
      products: [],
      orders: [],
    });

  const commands =
    useMemo<CommandItem[]>(
      () => [
        {
          id: "dashboard",
          title: "Dashboard",
          description:
            "Open dashboard overview",
          href: "/dashboard",
          icon: BarChart3,
          keywords: [
            "home",
            "overview",
          ],
        },

        {
          id: "analytics",
          title: "Analytics",
          description:
            "View business analytics",
          href: "/dashboard/analytics",
          icon: BarChart3,
          keywords: [
            "statistics",
            "metrics",
            "charts",
          ],
        },

        {
          id: "reports",
          title: "Reports",
          description:
            "View reports",
          href: "/dashboard/reports",
          icon: FileText,
          keywords: [
            "analytics",
            "documents",
          ],
        },

        {
          id: "customers",
          title: "Customers",
          description:
            "Manage customers",
          href: "/dashboard/customers",
          icon: Users,
          keywords: [
            "clients",
            "users",
          ],
        },

        {
          id: "products",
          title: "Products",
          description:
            "Manage products and services",
          href: "/dashboard/products",
          icon: Package,
          keywords: [
            "items",
            "services",
          ],
        },

        {
          id: "orders",
          title: "Orders",
          description:
            "View orders and transactions",
          href: "/dashboard/orders",
          icon: ShoppingCart,
          keywords: [
            "sales",
            "transactions",
          ],
        },

        {
          id: "transactions",
          title: "Transactions",
          description:
            "View transactions",
          href: "/dashboard/transactions",
          icon: FileText,
          keywords: [
            "payments",
            "refunds",
          ],
        },

        {
          id: "notifications",
          title: "Notifications",
          description:
            "View notifications",
          href: "/dashboard/notifications",
          icon: Bell,
          keywords: [
            "alerts",
          ],
        },

        {
          id: "exports",
          title: "Exports",
          description: "Download generated reports",
          href: "/dashboard/exports",
          icon: FileText,
          keywords: ["csv", "download", "export"],
        },

        {
          id: "activity",
          title: "Activity",
          description: "View workspace activity",
          href: "/dashboard/activity",
          icon: Bell,
          keywords: ["timeline", "feed"],
        },

        {
          id: "settings",
          title: "Settings",
          description:
            "Manage account settings",
          href: "/dashboard/settings",
          icon: Settings,
          keywords: [
            "preferences",
            "configuration",
          ],
        },

        ...(isAdmin
          ? [
              {
                id: "team",
                title: "Team",
                description: "Manage workspace members",
                href: "/dashboard/settings/team",
                icon: Users,
                keywords: ["members", "invite"],
              },
              {
                id: "billing",
                title: "Billing",
                description:
                  "Manage subscription and billing",
                href: "/dashboard/settings/billing",
                icon: CreditCard,
                keywords: [
                  "subscription",
                  "payment",
                ],
              },

              {
                id: "audit-logs",
                title: "Audit Logs",
                description:
                  "View workspace security activity",
                href: "/dashboard/audit-logs",
                icon: FileText,
                keywords: [
                  "security",
                  "activity",
                  "logs",
                ],
              },
            ]
          : []),

        {
          id: "create-customer",
          title: "Create customer",
          description:
            "Add a new customer",
          href: "/dashboard/customers/new",
          icon: Plus,
          keywords: [
            "new",
            "customer",
            "client",
          ],
        },

        {
          id: "create-product",
          title: "Create product",
          description:
            "Add a new product",
          href: "/dashboard/products/new",
          icon: Plus,
          keywords: [
            "new",
            "product",
          ],
        },

        {
          id: "create-order",
          title: "Create order",
          description:
            "Create a new order",
          href: "/dashboard/orders/new",
          icon: Plus,
          keywords: [
            "new",
            "order",
            "sale",
          ],
        },

        ...(isAdmin
          ? [
              {
                id: "invite-member",
                title:
                  "Invite team member",
                description:
                  "Invite someone to your workspace",
                href: "/dashboard/settings/team?invite=true",
                icon: UserPlus,
                keywords: [
                  "invite",
                  "team",
                  "member",
                ],
              },
            ]
          : []),
      ],
      [isAdmin],
    );

  const filteredCommands =
    useMemo(() => {
      const normalized =
        query
          .trim()
          .toLowerCase();

      if (!normalized) {
        return commands;
      }

      return commands.filter(
        (command) => {
          const searchableText =
            [
              command.title,
              command.description,
              ...(command.keywords ??
                []),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return searchableText.includes(
            normalized,
          );
        },
      );
    }, [commands, query]);

  useEffect(() => {
    function handleKeyboard(
      event: KeyboardEvent,
    ) {
      const isCommand =
        event.ctrlKey ||
        event.metaKey;

      if (
        isCommand &&
        event.key.toLowerCase() ===
          "k"
      ) {
        event.preventDefault();
        setActiveIndex(0);
        setOpen((current) => !current);
      }

      if (
        event.key === "Escape"
      ) {
        closePalette();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyboard,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard,
      );
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        document
          .getElementById(
            "command-search-input",
          )
          ?.focus();
      }, 0);

    return () =>
      window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const controller =
      new AbortController();

    const timer =
      window.setTimeout(
        async () => {
          try {
            const response =
              await fetch(
                `/api/search?q=${encodeURIComponent(
                  query,
                )}`,
                {
                  signal:
                    controller
                      .signal,
                },
              );

            if (!response.ok) {
              return;
            }

            const data =
              await response.json();

            setSearchResults(
              data,
            );
          } catch (error) {
            if (
              error instanceof DOMException &&
              error.name ===
                "AbortError"
            ) {
              return;
            }

            console.error(
              "Global search failed",
              error,
            );
          }
        },
        250,
      );

    return () => {
      window.clearTimeout(
        timer,
      );

      controller.abort();
    };
  }, [query]);

  function closePalette() {
    setOpen(false);

    setQuery("");

    setSearchResults({
      customers: [],
      products: [],
      orders: [],
    });
  }

  function executeCommand(
    command: CommandItem,
  ) {
    if (!command.href) {
      return;
    }

    closePalette();

    router.push(
      command.href,
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="hidden items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted md:flex"
        aria-label="Open command palette"
      >
        <CommandIcon className="h-4 w-4" />

        <span>
          Search
        </span>

        <kbd className="ml-4 rounded border bg-muted px-1.5 py-0.5 text-[10px]">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={() =>
            closePalette()
          }
        >
          <div
            className="mx-auto mt-[10vh] w-full max-w-2xl overflow-hidden rounded-2xl border bg-background shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center border-b px-4">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />

              <input
                id="command-search-input"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActiveIndex((current) =>
                      Math.min(filteredCommands.length - 1, current + 1),
                    );
                  }

                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveIndex((current) => Math.max(0, current - 1));
                  }

                  if (event.key === "Enter") {
                    const command = filteredCommands[activeIndex];
                    if (command) {
                      event.preventDefault();
                      executeCommand(command);
                    }
                  }
                }}
                placeholder="Search anything..."
                className="h-14 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
              />

              <button
                type="button"
                onClick={() =>
                  closePalette()
                }
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted"
                aria-label="Close command palette"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {query.trim().length >= 2 && (
              <div className="border-b p-2">
                {searchResults.customers.length >
                  0 && (
                  <SearchSection title="Customers">
                    {searchResults.customers.map(
                      (customer) => (
                        <SearchResult
                          key={
                            customer.id
                          }
                          title={
                            customer.name
                          }
                          description={
                            customer.email ??
                            undefined
                          }
                          onClick={() => {
                            closePalette();

                            router.push(
                              `/dashboard/customers/${customer.id}`,
                            );
                          }}
                        />
                      ),
                    )}
                  </SearchSection>
                )}

                {searchResults.products.length >
                  0 && (
                  <SearchSection title="Products">
                    {searchResults.products.map(
                      (product) => (
                        <SearchResult
                          key={
                            product.id
                          }
                          title={
                            product.name
                          }
                          onClick={() => {
                            closePalette();

                            router.push(
                              `/dashboard/products/${product.id}`,
                            );
                          }}
                        />
                      ),
                    )}
                  </SearchSection>
                )}

                {searchResults.orders.length >
                  0 && (
                  <SearchSection title="Orders">
                    {searchResults.orders.map(
                      (order) => (
                        <SearchResult
                          key={
                            order.id
                          }
                          title={`Order #${order.id.slice(
                            0,
                            8,
                          )}`}
                          description={
                            order.status
                          }
                          onClick={() => {
                            closePalette();

                            router.push(
                              `/dashboard/orders/${order.id}`,
                            );
                          }}
                        />
                      ),
                    )}
                  </SearchSection>
                )}
              </div>
            )}

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredCommands.length ===
              0 ? (
                <div className="px-6 py-12 text-center">
                  <Search className="mx-auto h-8 w-8 text-muted-foreground" />

                  <p className="mt-3 text-sm font-medium">
                    No results found
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Try searching for another page or action.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCommands.map(
                    (command, index) => {
                      const Icon =
                        command.icon;

                      return (
                        <button
                          key={
                            command.id
                          }
                          type="button"
                          onClick={() =>
                            executeCommand(
                              command,
                            )
                          }
                          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                            index === activeIndex
                              ? "bg-muted"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                            <Icon className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                              {
                                command.title
                              }
                            </p>

                            {command.description && (
                              <p className="truncate text-xs text-muted-foreground">
                                {
                                  command.description
                                }
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
              <span>
                Search and navigate
              </span>

              <div className="flex items-center gap-2">
                <kbd className="rounded border px-1.5 py-0.5">
                  ESC
                </kbd>

                <span>
                  Close
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SearchSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>

      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

function SearchResult({
  title,
  description,
  onClick,
}: {
  title: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center rounded-lg px-3 py-2.5 text-left transition hover:bg-muted"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {title}
        </p>

        {description && (
          <p className="truncate text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </button>
  );
}
