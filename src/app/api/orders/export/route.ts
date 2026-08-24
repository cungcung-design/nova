import { NextResponse } from "next/server";
import { AuditAction } from "@prisma/client";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { db } from "@/lib/db";
import { createCsv } from "@/lib/csv";
import { apiErrorResponse } from "@/lib/api-error";
import { parseIdList } from "@/lib/validation/common";

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

    const body = (await request.json()) as { ids?: unknown };
    const parsed = parseIdList(body.ids, 100);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const orders = await db.order.findMany({
      where: {
        workspaceId: workspace.id,
        id: { in: parsed.ids },
      },
      include: {
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const csv = createCsv(
      ["Order #", "Customer", "Status", "Payment", "Total", "Created At"],
      orders.map((order) => [
        order.orderNumber,
        order.customer?.name,
        order.status,
        order.paymentStatus,
        Number(order.total).toFixed(2),
        order.createdAt.toISOString(),
      ]),
    );

    await db.auditLog.create({
      data: {
        workspaceId: workspace.id,
        userId: workspace.userId,
        action: AuditAction.EXPORT_DATA,
        entity: "Order",
        description: `Exported ${orders.length} orders.`,
        metadata: { count: orders.length },
      },
    });

    return csvResponse(
      csv,
      `orders-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  } catch (error) {
    return apiErrorResponse(error, "Export failed.");
  }
}
