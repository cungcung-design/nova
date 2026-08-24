import type { UserRole } from "@prisma/client";

import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import type { ExportResource } from "@/types/export";

function resourceViewRoles(resource: ExportResource): readonly UserRole[] {
  switch (resource) {
    case "CUSTOMERS":
      return permissions.customers.view;
    case "PRODUCTS":
      return permissions.products.view;
    case "ORDERS":
    case "TRANSACTIONS":
      return permissions.orders.view;
    case "ANALYTICS":
      return permissions.reports.view;
    default:
      return permissions.reports.export;
  }
}

export async function requireExportAccess(
  workspaceId: string,
  resource?: ExportResource,
) {
  await requireRole(workspaceId, [...permissions.reports.export]);

  if (resource) {
    await requireRole(workspaceId, [...resourceViewRoles(resource)]);
  }
}
