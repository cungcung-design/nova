export type CustomerStatusFilter = "ACTIVE" | "INACTIVE" | "LEAD";

export type CustomerFilters = {
  search?: string;
  status?: "all" | "active" | "archived" | string;
  statuses?: CustomerStatusFilter[];
  minRevenue?: number;
  maxRevenue?: number;
  createdFrom?: string;
  createdTo?: string;
};

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterChip = {
  key: string;
  label: string;
};
