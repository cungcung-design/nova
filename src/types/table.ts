import type { ReactNode } from "react";

export type TableColumn<T> = {
  id: string;
  header: string;
  accessor?: keyof T;
  sortable?: boolean;
  hideable?: boolean;
  className?: string;
  render?: (row: T) => ReactNode;
};
