import type { ExportFormat, ExportResource } from "@/types/export";

const formats = new Set<ExportFormat>(["CSV", "XLSX", "PDF"]);

const resources = new Set<ExportResource>([
  "ORDERS",
  "CUSTOMERS",
  "PRODUCTS",
  "TRANSACTIONS",
  "ANALYTICS",
]);

export function isExportFormat(value: unknown): value is ExportFormat {
  return typeof value === "string" && formats.has(value as ExportFormat);
}

export function isExportResource(value: unknown): value is ExportResource {
  return typeof value === "string" && resources.has(value as ExportResource);
}

export function tableResourceToExportResource(
  resource: string,
): ExportResource | null {
  switch (resource) {
    case "customers":
      return "CUSTOMERS";
    case "orders":
      return "ORDERS";
    case "products":
      return "PRODUCTS";
    case "transactions":
      return "TRANSACTIONS";
    case "analytics":
    case "reports":
      return "ANALYTICS";
    default:
      return null;
  }
}
