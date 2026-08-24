import { getCurrentWorkspace } from "@/lib/current-workspace";

import { getWorkspaceSubscription } from "@/services/billing.service";

import { BillingClient } from "./billing-client";

export default async function BillingPage() {
  const workspace = await getCurrentWorkspace();

  const subscription =
    await getWorkspaceSubscription(workspace.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Billing
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your workspace subscription and billing.
        </p>
      </div>

      <BillingClient
        plan={subscription.plan}
        status={subscription.status}
        cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
        currentPeriodEnd={
          subscription.currentPeriodEnd?.toISOString() ??
          null
        }
      />
    </div>
  );
}
