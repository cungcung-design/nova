export type SortDirection = "asc" | "desc";

export type SortState = {
  field: string;
  direction: SortDirection;
};

export type PaginationState = {
  page: number;
  pageSize: number;
};

export type FilterValue = string | string[] | number | boolean | null;

export type TableFilter = {
  field: string;
  operator: "equals" | "contains" | "startsWith" | "gt" | "gte" | "lt" | "lte" | "in";
  value: FilterValue;
};

export type DataTableQuery = {
  search?: string;
  filters?: TableFilter[];
  sort?: SortState;
  page: number;
  pageSize: number;
};
