import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { hasPermission, permissions } from "@/lib/permissions";
import { getWorkspaceSubscription } from "@/services/billing.service";
import { BillingClient } from "./billing-client";

export default async function BillingPage() {
  const workspace = await getCurrentWorkspace();
  await requireRole(workspace.id, [...permissions.billing.view]);

  const subscription = await getWorkspaceSubscription(workspace.id);
  const canManage = hasPermission(workspace.role, permissions.billing.manage);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your workspace subscription and billing.
        </p>
      </div>

      <BillingClient
        plan={subscription.plan}
        status={subscription.status}
        cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
        currentPeriodEnd={
          subscription.currentPeriodEnd?.toISOString() ?? null
        }
        canManage={canManage}
      />
    </div>
  );
}
