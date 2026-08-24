import { AuditAction } from "@prisma/client";
import { headers } from "next/headers";

import { createAuditLog as writeAuditLog } from "@/services/audit.service";
import { getClientIp } from "@/lib/security/security";

type CreateAuditLogInput = {
  workspaceId?: string;
  userId?: string;
  action: string;
  entityType?: string;
  entity?: string;
  entityId?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};

const ACTION_ALIASES: Record<string, AuditAction> = {
  AUTH_LOGIN: AuditAction.LOGIN,
  AUTH_LOGOUT: AuditAction.LOGOUT,
  AUTH_LOGIN_FAILED: AuditAction.LOGIN_FAILED,
  PASSWORD_CHANGED: AuditAction.PASSWORD_CHANGED,
  USER_CREATED: AuditAction.CREATE,
  USER_UPDATED: AuditAction.UPDATE,
  USER_DELETED: AuditAction.DELETE,
  ROLE_CHANGED: AuditAction.CHANGE_ROLE,
  PERMISSION_CHANGED: AuditAction.CHANGE_ROLE,
  CUSTOMER_CREATED: AuditAction.CREATE,
  CUSTOMER_UPDATED: AuditAction.UPDATE,
  CUSTOMER_DELETED: AuditAction.DELETE,
  ORDER_CREATED: AuditAction.CREATE,
  ORDER_UPDATED: AuditAction.UPDATE,
  ORDER_CANCELLED: AuditAction.UPDATE,
  PRODUCT_CREATED: AuditAction.CREATE,
  PRODUCT_UPDATED: AuditAction.UPDATE,
  PRODUCT_DELETED: AuditAction.DELETE,
  SUBSCRIPTION_CREATED: AuditAction.SUBSCRIPTION_CREATED,
  SUBSCRIPTION_CHANGED: AuditAction.SUBSCRIPTION_UPDATED,
  SUBSCRIPTION_CANCELLED: AuditAction.SUBSCRIPTION_CANCELLED,
  API_KEY_CREATED: AuditAction.CREATE,
  API_KEY_REVOKED: AuditAction.DELETE,
  EXPORT_CREATED: AuditAction.EXPORT_DATA,
};

function resolveAction(action: string): AuditAction {
  if ((Object.values(AuditAction) as string[]).includes(action)) {
    return action as AuditAction;
  }

  return ACTION_ALIASES[action] ?? AuditAction.UPDATE;
}

export async function getAuditRequestContext(request?: Request) {
  if (request) {
    return {
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") ?? undefined,
    };
  }

  try {
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");

    return {
      ipAddress:
        forwarded?.split(",")[0]?.trim() ||
        headerList.get("x-real-ip") ||
        undefined,
      userAgent: headerList.get("user-agent") ?? undefined,
    };
  } catch {
    return {};
  }
}

export async function createAuditLog(input: CreateAuditLogInput) {
  try {
    const context = await getAuditRequestContext();

    return await writeAuditLog({
      workspaceId: input.workspaceId,
      userId: input.userId,
      action: resolveAction(input.action),
      entity: input.entityType ?? input.entity,
      entityId: input.entityId,
      description: input.description,
      ipAddress: input.ipAddress ?? context.ipAddress,
      userAgent: input.userAgent ?? context.userAgent,
      metadata: input.metadata ?? {},
    });
  } catch (error) {
    console.error("Audit log error:", error);
    return null;
  }
}
