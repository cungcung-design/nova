import { NextResponse } from "next/server";

import { apiErrorResponse } from "@/lib/api-error";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { getTransactions } from "@/services/transaction.service";
import { sanitizeSearchQuery } from "@/lib/security/security";
import { paginationSchema } from "@/lib/validation/common";

export async function GET(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();
    await requireRole(workspace.id, [...permissions.orders.view]);

    const url = new URL(request.url);
    const parsed = paginationSchema.safeParse({
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? "25",
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid pagination.", message: "Invalid pagination." },
        { status: 400 },
      );
    }

    const result = await getTransactions({
      workspaceId: workspace.id,
      search: sanitizeSearchQuery(url.searchParams.get("search") ?? ""),
      status: url.searchParams.get("status") ?? undefined,
      type: url.searchParams.get("type") ?? undefined,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error, "Unable to load transactions.");
  }
}
