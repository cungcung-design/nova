"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useTableFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  const setFilter = useCallback(
    (key: string, value: string | undefined) => {
      const next = new URLSearchParams(params.toString());

      if (value === undefined || value === "" || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }

      next.set("page", "1");

      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  const setFilters = useCallback(
    (values: Record<string, string | undefined>) => {
      const next = new URLSearchParams(params.toString());

      Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === "all") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });

      next.set("page", "1");

      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  const clearFilters = useCallback(() => {
    const next = new URLSearchParams(params.toString());
    const preserved = ["search", "pageSize", "sortBy", "sortDirection", "columns"];

    Array.from(next.keys()).forEach((key) => {
      if (!preserved.includes(key)) {
        next.delete(key);
      }
    });

    next.set("page", "1");

    router.push(`${pathname}?${next.toString()}`);
  }, [params, pathname, router]);

  return {
    params,
    setFilter,
    setFilters,
    clearFilters,
  };
}
