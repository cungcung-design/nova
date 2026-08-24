import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";

import {
  createProduct,
  getProducts,
} from "@/services/product.service";

import { productSchema } from "@/lib/validations/product";

export async function GET(request: Request) {
  try {
    const workspace =
      await getCurrentWorkspace();

    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams.get("search") || undefined;

    const status =
      searchParams.get("status") as
        | "ACTIVE"
        | "INACTIVE"
        | "OUT_OF_STOCK"
        | null;

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1,
    );

    const result = await getProducts({
      workspaceId: workspace.id,
      search,
      status: status || undefined,
      page,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error: "Unable to fetch products.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const workspace =
      await getCurrentWorkspace();

    await requireRole(
      workspace.id,
      [...permissions.products.create],
    );

    const body = await request.json();

    const parsed =
      productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid product data.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const product = await createProduct(
      workspace.id,
      parsed.data,
    );

    return NextResponse.json(
      product,
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        error: "Unable to create product.",
      },
      { status: 500 },
    );
  }
}
