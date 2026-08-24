"use client";

import * as React from "react";

type ContextMenuProps = {
  children: React.ReactNode;
};

const ContextMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

function useMenuContext() {
  const context = React.use(ContextMenuContext);
  if (!context) {
    throw new Error(
      "Menu components must be used within a menu",
    );
  }
  return context;
}

function DropdownMenu({
  children,
  ...props
}: ContextMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <ContextMenuContext.Provider
      value={{ open, setOpen }}
    >
      <div {...props}>{children}</div>
    </ContextMenuContext.Provider>
  );
}

function DropdownMenuTrigger({
  children,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { setOpen } = useMenuContext();

  const child = React.Children.only(children);

  if (asChild && React.isValidElement(child)) {
    return React.cloneElement(child as React.ReactElement<React.ComponentProps<"button">, string>, {
      onClick: () => setOpen(true),
      ...props,
    } as React.ComponentProps<"button">);
  }

  return (
    <button
      onClick={() => setOpen(true)}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({
  children,
  className,
  align,
  ...props
}: React.ComponentProps<"div"> & { align?: string }) {
  const { open } = useMenuContext();

  if (!open) {
    return null;
  }

  return (
    <div
      data-align={align}
      className={
        "z-50 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md " +
        (className ?? "")
      }
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { setOpen } = useMenuContext();

  return (
    <div
      onClick={() => setOpen(false)}
      className={
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground " +
        (className ?? "")
      }
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={
        "px-2 py-1.5 text-sm font-semibold " +
        (className ?? "")
      }
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={
        "-mx-1 my-1 h-px bg-muted " +
        (className ?? "")
      }
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
