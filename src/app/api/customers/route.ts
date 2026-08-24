import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireUser, requireRole } from "@/lib/authz";
import { permissions, hasPermission } from "@/lib/permissions";
import {
  createCustomer,
  getCustomers,
} from "@/services/customer.service";
import { customerSchema } from "@/lib/validations/customer";
import { apiErrorResponse } from "@/lib/api-error";
import { getWorkspaceSubscription } from "@/services/billing.service";
import { canAddCustomer } from "@/lib/billing-limits";
import { db } from "@/lib/db";
import { getCustomerFilters } from "@/lib/filters";
import { createAuditLog } from "@/lib/audit/audit-service";

export async function GET(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();

    const url = new URL(request.url);
    const filters = getCustomerFilters(url.searchParams);

    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
    const pageSize = Math.min(
      100,
      Math.max(10, Number(url.searchParams.get("pageSize") ?? "25")),
    );

    const sortBy =
      url.searchParams.get("sortBy") ??
      url.searchParams.get("sort") ??
      "createdAt";

    const sortDirection =
      (url.searchParams.get("sortDirection") ??
        url.searchParams.get("direction")) === "asc"
        ? "asc"
        : "desc";

    const allowedSortFields = ["createdAt", "name", "email", "status"] as const;
    const safeSortBy = allowedSortFields.includes(
      sortBy as (typeof allowedSortFields)[number],
    )
      ? sortBy
      : "createdAt";

    const result = await getCustomers({
      workspaceId: workspace.id,
      search: filters.search,
      statuses: filters.statuses,
      page,
      pageSize,
      sortBy: safeSortBy,
      sortDirection,
      createdFrom: filters.createdFrom,
      createdTo: filters.createdTo,
      minRevenue: filters.minRevenue,
      maxRevenue: filters.maxRevenue,
    });

    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error, "Unable to load customers.");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const workspace = await getCurrentWorkspace();

    const membership = await requireRole(workspace.id, [...permissions.customers.create]);

    if (!hasPermission(membership.role, permissions.customers.create)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = customerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid customer data.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const subscription = await getWorkspaceSubscription(workspace.id);
    const customerCount = await db.customer.count({
      where: { workspaceId: workspace.id },
    });

    if (!(await canAddCustomer(subscription.plan, customerCount))) {
      throw new Error("PLAN_LIMIT");
    }

    const customer = await createCustomer(workspace.id, user.id!, parsed.data);

    await createAuditLog({
      workspaceId: workspace.id,
      userId: user.id,
      action: "CUSTOMER_CREATED",
      entityType: "CUSTOMER",
      entityId: customer.id,
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "Unable to create customer.");
  }
}
