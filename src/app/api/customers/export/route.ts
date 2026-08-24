import { NextResponse } from "next/server";
import { AuditAction } from "@prisma/client";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { db } from "@/lib/db";
import { createCsv } from "@/lib/csv";
import { apiErrorResponse } from "@/lib/api-error";
import { parseIdList } from "@/lib/validation/common";
import type { ExportRequest } from "@/types/export";

function csvResponse(csv: string, filename: string) {
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();
    await requireRole(workspace.id, [...permissions.reports.export]);

    const body = (await request.json()) as ExportRequest;

    if (body.format && body.format !== "csv") {
      return NextResponse.json(
        { error: "Only CSV export is currently supported." },
        { status: 400 },
      );
    }

    const where: {
      workspaceId: string;
      id?: { in: string[] };
    } = {
      workspaceId: workspace.id,
    };

    if (body.scope === "selected") {
      const parsed = parseIdList(body.ids, 100);

      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }

      where.id = { in: parsed.ids };
    }

    const customers = await db.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10000,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        status: true,
      },
    });

    const csv = createCsv(
      ["ID", "Name", "Email", "Status", "Created At"],
      customers.map((customer) => [
        customer.id,
        customer.name,
        customer.email,
        customer.status,
        customer.createdAt.toISOString(),
      ]),
    );

    await db.auditLog.create({
      data: {
        workspaceId: workspace.id,
        userId: workspace.userId,
        action: AuditAction.EXPORT_DATA,
        entity: "Customer",
        description: `Exported ${customers.length} customers.`,
        metadata: {
          scope: body.scope,
          count: customers.length,
        },
      },
    });

    return csvResponse(
      csv,
      `customers-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  } catch (error) {
    return apiErrorResponse(error, "Export failed.");
  }
}
