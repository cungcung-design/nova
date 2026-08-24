import {
  SubscriptionPlan,
} from "@prisma/client";

import { billingPlans } from "@/config/billing";

export function getPlanLimits(
  plan: SubscriptionPlan,
) {
  return billingPlans[plan].limits;
}

export async function canAddTeamMember(
  plan: SubscriptionPlan,
  currentCount: number,
) {
  const limit = getPlanLimits(plan).teamMembers;

  return limit === Infinity || currentCount < limit;
}

export async function canAddCustomer(
  plan: SubscriptionPlan,
  currentCount: number,
) {
  const limit = getPlanLimits(plan).customers;

  return limit === Infinity || currentCount < limit;
}

export async function canAddProduct(
  plan: SubscriptionPlan,
  currentCount: number,
) {
  const limit = getPlanLimits(plan).products;

  return limit === Infinity || currentCount < limit;
}
