import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { getAuditLogs } from "@/services/audit.service";
import { paginationSchema } from "@/lib/validation/common";
import { apiErrorResponse } from "@/lib/api-error";
import { sanitizeSearchQuery } from "@/lib/security/security";
import { AuditAction } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const workspace = await getCurrentWorkspace();

    if (!hasPermission(workspace.role, "audit.read")) {
      return Response.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    const url = new URL(request.url);
    const parsed = paginationSchema.safeParse({
      page: url.searchParams.get("page") ?? "1",
      pageSize:
        url.searchParams.get("pageSize") ??
        url.searchParams.get("limit") ??
        "20",
    });

    if (!parsed.success) {
      return Response.json(
        {
          message: "Invalid pagination.",
        },
        {
          status: 400,
        },
      );
    }

    const { page, pageSize } = parsed.data;
    const searchValue = url.searchParams.get("search");
    const actionParam = url.searchParams.get("action");
    const action = isAuditAction(actionParam) ? actionParam : undefined;

    const result = await getAuditLogs(workspace.id, {
      search: searchValue ? sanitizeSearchQuery(searchValue) : undefined,
      action,
      page,
      limit: pageSize,
    });

    return Response.json({
      data: result.logs,
      logs: result.logs,
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
    return apiErrorResponse(error, "Unable to load audit logs.");
  }
}

function isAuditAction(value: string | null): value is AuditAction {
  if (!value) {
    return false;
  }

  return (Object.values(AuditAction) as string[]).includes(value);
}
