import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import {
  createProduct,
  getProducts,
} from "@/services/product.service";

import { productSchema } from "@/lib/validations/product";
import { apiErrorResponse } from "@/lib/api-error";
import { getWorkspaceSubscription } from "@/services/billing.service";
import { canAddProduct } from "@/lib/billing-limits";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
) {
  try {
    const workspace =
      await getCurrentWorkspace();

    await requireRole(
      workspace.id,
      [...permissions.products.view],
    );

    const url =
      new URL(request.url);

    const search =
      url.searchParams
        .get("search")
        ?.trim() ?? "";

    const status =
      url.searchParams.get("status");

    const page = Math.max(
      1,
      Number(
        url.searchParams.get("page") ?? "1",
      ),
    );

    const pageSize = Math.min(
      100,
      Math.max(
        10,
        Number(
          url.searchParams.get(
            "pageSize",
          ) ?? "25",
        ),
      ),
    );

    const sortBy =
      url.searchParams.get(
        "sortBy",
      ) ?? "createdAt";

    const sortDirection =
      url.searchParams.get(
        "sortDirection",
      ) === "asc"
        ? "asc"
        : "desc";

    const result =
      await getProducts({
        workspaceId: workspace.id,
        search: search || undefined,
        status: status || undefined,
        page,
        pageSize,
        sortBy,
        sortDirection,
      });

    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error, "Unable to fetch products.");
  }
}

export async function POST(
  request: Request,
) {
  try {
    const workspace =
      await getCurrentWorkspace();

    await requireRole(
      workspace.id,
      [...permissions.products.create],
    );

    const body = await request.json();

    const parsed =
      productSchema.safeParse(
        body,
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Invalid product data.",
          details:
            parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const subscription = await getWorkspaceSubscription(workspace.id);
    const productCount = await db.product.count({
      where: { workspaceId: workspace.id },
    });

    if (!(await canAddProduct(subscription.plan, productCount))) {
      throw new Error("PLAN_LIMIT");
    }

    const product =
      await createProduct(
        workspace.id,
        parsed.data,
      );

    return NextResponse.json(
      product,
      { status: 201 },
    );
  } catch (error) {
    return apiErrorResponse(error, "Unable to create product.");
  }
}
