export type BillingInterval = "MONTH" | "YEAR";

export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "UNPAID"
  | "PAUSED";

export type PlanSlug = "FREE" | "PRO" | "BUSINESS";
