"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type DropdownAlign = "start" | "end";

type DropdownMenuProps = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  align?: DropdownAlign;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
  role?: "menu" | "dialog" | "listbox";
};

const VIEWPORT_PADDING = 8;

export function DropdownMenu({
  open,
  onClose,
  triggerRef,
  align = "end",
  children,
  className,
  labelledBy,
  role = "menu",
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({
    position: "fixed",
    top: 0,
    left: 0,
    visibility: "hidden",
  });
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;

    if (!trigger || !menu) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxHeight = Math.max(
      160,
      viewportHeight - VIEWPORT_PADDING * 2,
    );

    let left =
      align === "end" ? rect.right - menuWidth : rect.left;

    if (left < VIEWPORT_PADDING) {
      left = VIEWPORT_PADDING;
    }

    if (left + menuWidth > viewportWidth - VIEWPORT_PADDING) {
      left = Math.max(
        VIEWPORT_PADDING,
        viewportWidth - menuWidth - VIEWPORT_PADDING,
      );
    }

    const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_PADDING;
    const spaceAbove = rect.top - VIEWPORT_PADDING;
    const openAbove =
      menuHeight > spaceBelow && spaceAbove > spaceBelow;

    const top = openAbove
      ? Math.max(VIEWPORT_PADDING, rect.top - Math.min(menuHeight, maxHeight) - 8)
      : rect.bottom + 8;

    setStyle({
      position: "fixed",
      top,
      left,
      zIndex: 70,
      maxHeight,
      visibility: "visible",
      width: Math.min(menuWidth, viewportWidth - VIEWPORT_PADDING * 2),
    });
  }, [align, triggerRef]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    place();
    const frame = window.requestAnimationFrame(place);

    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place, children]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function menuItems() {
      const menu = menuRef.current;

      if (!menu) {
        return [];
      }

      return Array.from(
        menu.querySelectorAll<HTMLElement>(
          '[role="menuitem"]:not([disabled]), [role="menuitemcheckbox"]:not([disabled]), [role="menuitemradio"]:not([disabled])',
        ),
      ).filter((item) => item.getAttribute("aria-disabled") !== "true");
    }

    if (role === "menu") {
      window.requestAnimationFrame(() => {
        menuItems()[0]?.focus();
      });
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        triggerRef.current?.focus();
        return;
      }

      if (role !== "menu") {
        return;
      }

      const items = menuItems();

      if (items.length === 0) {
        return;
      }

      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      if (event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey)) {
        event.preventDefault();
        const nextIndex =
          currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
        items[nextIndex]?.focus();
        return;
      }

      if (event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey)) {
        event.preventDefault();
        const nextIndex =
          currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        items[nextIndex]?.focus();
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        items[0]?.focus();
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        items[items.length - 1]?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, triggerRef, role]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <>
      <button
        type="button"
        tabIndex={-1}
        className="fixed inset-0 z-[60] cursor-default bg-transparent"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        ref={menuRef}
        role={role}
        aria-labelledby={labelledBy}
        style={style}
        className={cn(
          "overflow-y-auto overflow-x-hidden rounded-xl border bg-card text-card-foreground shadow-xl",
          className,
        )}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}

type UseDropdownOptions = {
  defaultOpen?: boolean;
};

export function useDropdown({ defaultOpen = false }: UseDropdownOptions = {}) {
  const triggerId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(defaultOpen);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((current) => !current), []);

  return {
    open,
    setOpen,
    close,
    toggle,
    triggerRef,
    triggerId,
    triggerProps: {
      id: triggerId,
      ref: triggerRef,
      type: "button" as const,
      "aria-expanded": open,
      "aria-haspopup": "menu" as const,
      onClick: toggle,
    },
  };
}
