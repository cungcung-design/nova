import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireUser, requireRole } from "@/lib/authz";
import { permissions, hasPermission } from "@/lib/permissions";
import {
  createCustomer,
  getCustomers,
} from "@/services/customer.service";
import { customerSchema } from "@/lib/validations/customer";

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
        | "LEAD"
        | null;

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1,
    );

    const result = await getCustomers({
      workspaceId: workspace.id,
      search,
      status: status || undefined,
      page,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to fetch customers." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const workspace =
      await getCurrentWorkspace();

    const membership = await requireRole(
      workspace.id,
      [...permissions.customers.create],
    );

    if (
      !hasPermission(
        membership.role,
        permissions.customers.create,
      )
    ) {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const parsed =
      customerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid customer data.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const customer = await createCustomer(
      workspace.id,
      user.id!,
      parsed.data,
    );

    return NextResponse.json(
      customer,
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to create customer." },
      { status: 500 },
    );
  }
}
