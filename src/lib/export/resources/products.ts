import { db } from "@/lib/db";
import { toNumber } from "@/lib/utils";
import { getFilterString, getFilterStringList } from "@/lib/export/filters";
import { getProducts } from "@/services/product.service";

export async function getProductsForExport(
  workspaceId: string,
  filters: Record<string, unknown> = {},
) {
  const ids = getFilterStringList(filters, "ids");

  if (ids && ids.length > 0) {
    const products = await db.product.findMany({
      where: {
        workspaceId,
        id: { in: ids },
      },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    return products.map((product) => ({
      ID: product.id,
      Name: product.name,
      SKU: product.sku,
      Price: toNumber(product.price),
      Stock: product.stock,
      Status: product.status,
      Created: product.createdAt.toISOString(),
    }));
  }

  const result = await getProducts({
    workspaceId,
    search: getFilterString(filters, "search"),
    status: getFilterString(filters, "status"),
    sortBy: getFilterString(filters, "sortBy") ?? getFilterString(filters, "sort"),
    sortDirection:
      getFilterString(filters, "sortDirection") === "asc" ||
      getFilterString(filters, "direction") === "asc"
        ? "asc"
        : "desc",
    page: 1,
    pageSize: 10000,
  });

  return result.products.map((product) => ({
    ID: product.id,
    Name: product.name,
    SKU: product.sku,
    Price: product.price,
    Stock: product.stock,
    Status: product.status,
    Created: new Date(product.createdAt).toISOString(),
  }));
}
