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
  } catch {
    return NextResponse.json(
      {
        error: "Unable to fetch product.",
      },
      { status: 500 },
    );
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

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to update product.",
      },
      { status: 500 },
    );
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

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to delete product.",
      },
      { status: 500 },
    );
  }
}
