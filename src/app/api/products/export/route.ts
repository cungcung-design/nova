import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions, hasPermission } from "@/lib/permissions";
import { getProducts } from "@/services/product.service";

export async function GET(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();

    const membership = await requireRole(workspace.id, [...permissions.products.view]);

    if (!hasPermission(membership.role, permissions.products.view)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const url = new URL(request.url);

    const search = url.searchParams.get("search")?.trim() ?? "";
    const status = url.searchParams.get("status");
    const sortBy = url.searchParams.get("sortBy") ?? "createdAt";
    const sortDirection = url.searchParams.get("sortDirection") === "asc" ? "asc" : "desc";

    const allowedSortFields = ["createdAt", "name", "price", "stock"] as const;
    const safeSortBy = allowedSortFields.includes(sortBy as (typeof allowedSortFields)[number])
      ? sortBy
      : "createdAt";

    const result = await getProducts({
      workspaceId: workspace.id,
      search: search || undefined,
      status: status || undefined,
      page: 1,
      pageSize: 10000,
      sortBy: safeSortBy,
      sortDirection,
    });

    const products = result.products;

    const headers: Record<string, string> = {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="products-${new Date().toISOString().split("T")[0]}.csv"`,
    };

    const csvRows = [
      ["Name", "SKU", "Price", "Stock", "Status", "Created At"],
      ...products.map((p) => [
        `"${(p.name || "").replace(/"/g, '""')}"`,
        `"${(p.sku || "").replace(/"/g, '""')}"`,
        Number(p.price).toFixed(2),
        p.stock,
        p.status,
        new Date(p.createdAt).toISOString(),
      ]),
    ];

    const csv = csvRows.map((row) => row.join(",")).join("\n");

    return new NextResponse(csv, { headers });
  } catch (error) {
    console.error("GET /api/products/export", error);
    return NextResponse.json(
      { error: "Export failed." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();

    const membership = await requireRole(workspace.id, [...permissions.products.view]);

    if (!hasPermission(membership.role, permissions.products.view)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = (await request.json()) as { ids?: string[] };
    const ids = Array.isArray(body.ids) ? body.ids : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "No products selected." }, { status: 400 });
    }

    const result = await getProducts({
      workspaceId: workspace.id,
      page: 1,
      pageSize: 10000,
    });

    const products = result.products.filter((product) => ids.includes(product.id));

    const headers: Record<string, string> = {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="products-${new Date().toISOString().split("T")[0]}.csv"`,
    };

    const csvRows = [
      ["Name", "SKU", "Price", "Stock", "Status", "Created At"],
      ...products.map((p) => [
        `"${(p.name || "").replace(/"/g, '""')}"`,
        `"${(p.sku || "").replace(/"/g, '""')}"`,
        Number(p.price).toFixed(2),
        p.stock,
        p.status,
        new Date(p.createdAt).toISOString(),
      ]),
    ];

    const csv = csvRows.map((row) => row.join(",")).join("\n");

    return new NextResponse(csv, { headers });
  } catch (error) {
    console.error("POST /api/products/export", error);
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
