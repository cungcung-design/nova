import { NextResponse } from "next/server";

import { AuditAction } from "@prisma/client";

import { getCurrentWorkspace } from "@/lib/current-workspace";

import { requireWorkspaceRole } from "@/lib/workspace-permissions";

import { getAuditLogs } from "@/services/audit.service";

export async function GET(
  request: Request,
) {
  try {
    const workspace =
      await getCurrentWorkspace();

    await requireWorkspaceRole(
      workspace.id,
      workspace.userId,
      "ADMIN",
    );

    const url =
      new URL(request.url);

    const search =
      url.searchParams.get("search") ??
      undefined;

    const action =
      url.searchParams.get("action") as
        | AuditAction
        | undefined;

    const page = Math.max(
      1,
      Number(
        url.searchParams.get("page") ?? 1,
      ),
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number(
          url.searchParams.get("limit") ?? 25,
        ),
      ),
    );

    const result = await getAuditLogs(
      workspace.id,
      {
        search,
        action,
        page,
        limit,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "GET /api/audit-logs",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load audit logs.",
      },
      { status: 403 },
    );
  }
}