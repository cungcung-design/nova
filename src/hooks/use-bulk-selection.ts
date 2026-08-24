"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

export function useBulkSelection<T extends string>() {
  const [selectedIds, setSelectedIds] =
    useState<Set<T>>(new Set());

  const toggle = useCallback(
    (id: T) => {
      setSelectedIds((current) => {
        const next = new Set(current);

        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }

        return next;
      });
    },
    [],
  );

  const selectMany = useCallback(
    (ids: T[]) => {
      setSelectedIds(
        new Set(ids),
      );
    },
    [],
  );

  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedArray =
    useMemo(
      () =>
        Array.from(selectedIds),
      [selectedIds],
    );

  return {
    selectedIds,
    selectedArray,
    selectedCount:
      selectedIds.size,
    toggle,
    selectMany,
    clear,
  };
}
