import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions, hasPermission } from "@/lib/permissions";

import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "@/services/customer.service";

import { customerSchema } from "@/lib/validations/customer";
import { createAuditLog } from "@/lib/audit/audit-service";
import { apiErrorResponse } from "@/lib/api-error";

type Context = {
  params: Promise<{
    customerId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: Context,
) {
  try {
    const { customerId } = await params;

    const workspace =
      await getCurrentWorkspace();

    const customer =
      await getCustomerById(
        workspace.id,
        customerId,
      );

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(customer);
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch customer." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: Context,
) {
  try {
    const { customerId } = await params;

    const workspace =
      await getCurrentWorkspace();

    const membership = await requireRole(
      workspace.id,
      [...permissions.customers.update],
    );

    if (
      !hasPermission(
        membership.role,
        permissions.customers.update,
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
        { error: "Invalid customer data." },
        { status: 400 },
      );
    }

    await updateCustomer(
      workspace.id,
      customerId,
      parsed.data,
    );

    await createAuditLog({
      workspaceId: workspace.id,
      userId: workspace.userId,
      action: "CUSTOMER_UPDATED",
      entityType: "CUSTOMER",
      entityId: customerId,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to update customer.");
  }
}

export async function DELETE(
  _request: Request,
  { params }: Context,
) {
  try {
    const { customerId } = await params;

    const workspace =
      await getCurrentWorkspace();

    const membership = await requireRole(
      workspace.id,
      [...permissions.customers.delete],
    );

    if (
      !hasPermission(
        membership.role,
        permissions.customers.delete,
      )
    ) {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 },
      );
    }

    await deleteCustomer(
      workspace.id,
      customerId,
    );

    await createAuditLog({
      workspaceId: workspace.id,
      userId: workspace.userId,
      action: "CUSTOMER_DELETED",
      entityType: "CUSTOMER",
      entityId: customerId,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to delete customer.");
  }
}
