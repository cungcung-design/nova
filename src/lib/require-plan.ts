import {
  SubscriptionPlan,
} from "@prisma/client";

import { db } from "@/lib/db";

export async function requirePlan(
  workspaceId: string,
  requiredPlan: SubscriptionPlan,
) {
  const subscription =
    await db.subscription.findUnique({
      where: {
        workspaceId,
      },
    });

  if (!subscription) {
    throw new Error(
      "Workspace subscription not found.",
    );
  }

  const rank = {
    FREE: 0,
    PRO: 1,
  } as const;

  if (rank[subscription.plan] < rank[requiredPlan]) {
    throw new Error(
      "This feature requires a Pro subscription.",
    );
  }

  return subscription;
}
