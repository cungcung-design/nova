export type BillingInterval = "MONTH" | "YEAR";

export type PaidPlanSlug = "pro" | "business";

export type CheckoutInput = {
  workspaceId: string;
  userId: string;
  priceId: string;
  customerId?: string | null;
  email?: string;
  customerName?: string | null;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

export type CheckoutResult = {
  checkoutUrl: string;
  sessionId: string;
};

export type WebhookResult = {
  type: string;
  data: Record<string, unknown>;
};

export interface PaymentProvider {
  createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult>;
  createCustomer(email: string, name?: string | null): Promise<string>;
  createBillingPortal(customerId: string, returnUrl: string): Promise<string>;
  verifyWebhook(payload: string, signature: string): Promise<WebhookResult>;
}
