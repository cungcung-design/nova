import type {
  CustomerFilters,
  CustomerStatusFilter,
} from "@/types/filters";
import { sanitizeSearchQuery } from "@/lib/security/security";

const CUSTOMER_STATUSES: CustomerStatusFilter[] = [
  "ACTIVE",
  "INACTIVE",
  "LEAD",
];

export function getStringParam(
  params: URLSearchParams,
  key: string,
) {
  const value = params.get(key);

  return value?.trim() || undefined;
}

export function getNumberParam(
  params: URLSearchParams,
  key: string,
) {
  const value = params.get(key);

  if (!value) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

export function parseCustomerStatuses(
  value?: string,
): CustomerStatusFilter[] | undefined {
  if (!value || value === "all") {
    return undefined;
  }

  const mapped = value
    .split(",")
    .map((item) => item.trim())
    .flatMap((item) => {
      const normalized = item.toLowerCase();

      if (normalized === "active") {
        return ["ACTIVE" as const];
      }

      if (normalized === "archived" || normalized === "inactive") {
        return ["INACTIVE" as const];
      }

      if (normalized === "lead") {
        return ["LEAD" as const];
      }

      if (CUSTOMER_STATUSES.includes(item as CustomerStatusFilter)) {
        return [item as CustomerStatusFilter];
      }

      return [];
    });

  const unique = [...new Set(mapped)];

  return unique.length > 0 ? unique : undefined;
}

export function statusParamToValues(value?: string) {
  return parseCustomerStatuses(value) ?? [];
}

export function getCustomerFilters(
  params: URLSearchParams,
): CustomerFilters {
  const status = getStringParam(params, "status");
  const createdFrom =
    getStringParam(params, "createdFrom") ??
    getStringParam(params, "dateFrom");
  const createdTo =
    getStringParam(params, "createdTo") ??
    getStringParam(params, "dateTo");

  const search = getStringParam(params, "search");

  return {
    search: search ? sanitizeSearchQuery(search) : undefined,
    status,
    statuses: parseCustomerStatuses(status),
    minRevenue: getNumberParam(params, "minRevenue"),
    maxRevenue: getNumberParam(params, "maxRevenue"),
    createdFrom,
    createdTo,
  };
}

export function getCustomerFiltersFromRecord(
  params: Record<string, string | string[] | undefined>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value.trim()) {
      searchParams.set(key, value);
    }
  }

  return getCustomerFilters(searchParams);
}

export function formatCurrencyFilter(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
