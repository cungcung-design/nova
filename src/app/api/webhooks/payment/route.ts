import { handlePaymentWebhookRequest } from "@/lib/payments/webhook-http";

export async function POST(request: Request) {
  return handlePaymentWebhookRequest(request);
}
