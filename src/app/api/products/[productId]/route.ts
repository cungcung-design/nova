import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";

import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/services/product.service";

import { productSchema } from "@/lib/validations/product";
import { createAuditLog } from "@/lib/audit/audit-service";
import { apiErrorResponse } from "@/lib/api-error";

type Context = {
  params: Promise<{
    productId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: Context,
) {
  try {
    const { productId } = await params;

    const workspace =
      await getCurrentWorkspace();

    await requireRole(
      workspace.id,
      [...permissions.products.view],
    );

    const product =
      await getProductById(
        workspace.id,
        productId,
      );

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    return apiErrorResponse(error, "Unable to fetch product.");
  }
}

export async function PATCH(
  request: Request,
  { params }: Context,
) {
  try {
    const { productId } = await params;

    const workspace =
      await getCurrentWorkspace();

    await requireRole(
      workspace.id,
      [...permissions.products.update],
    );

    const body = await request.json();

    const parsed =
      productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid product data.",
        },
        { status: 400 },
      );
    }

    await updateProduct(
      workspace.id,
      productId,
      parsed.data,
    );

    await createAuditLog({
      workspaceId: workspace.id,
      userId: workspace.userId,
      action: "PRODUCT_UPDATED",
      entityType: "PRODUCT",
      entityId: productId,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to update product.");
  }
}

export async function DELETE(
  _request: Request,
  { params }: Context,
) {
  try {
    const { productId } = await params;

    const workspace =
      await getCurrentWorkspace();

    await requireRole(
      workspace.id,
      [...permissions.products.delete],
    );

    await deleteProduct(
      workspace.id,
      productId,
    );

    await createAuditLog({
      workspaceId: workspace.id,
      userId: workspace.userId,
      action: "PRODUCT_DELETED",
      entityType: "PRODUCT",
      entityId: productId,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to delete product.");
  }
}
