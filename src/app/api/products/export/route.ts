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

    const products = await db.product.findMany({
      where: {
        workspaceId: workspace.id,
        id: { in: parsed.ids },
      },
      orderBy: { createdAt: "desc" },
    });

    const csv = createCsv(
      ["Name", "SKU", "Price", "Stock", "Status", "Created At"],
      products.map((product) => [
        product.name,
        product.sku,
        Number(product.price).toFixed(2),
        product.stock,
        product.status,
        product.createdAt.toISOString(),
      ]),
    );

    await db.auditLog.create({
      data: {
        workspaceId: workspace.id,
        userId: workspace.userId,
        action: AuditAction.EXPORT_DATA,
        entity: "Product",
        description: `Exported ${products.length} products.`,
        metadata: { count: products.length },
      },
    });

    return csvResponse(
      csv,
      `products-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  } catch (error) {
    return apiErrorResponse(error, "Export failed.");
  }
}
