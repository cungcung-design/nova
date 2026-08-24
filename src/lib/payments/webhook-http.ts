import { NextResponse } from "next/server";

import { paymentProvider } from "@/lib/payments/provider-implementation";
import { applyPaymentWebhook } from "@/lib/payments/webhooks";

export async function handlePaymentWebhookRequest(request: Request) {
  const payload = await request.text();
  const signature =
    request.headers.get("payment-signature") ??
    request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  try {
    const event = await paymentProvider.verifyWebhook(payload, signature);
    await applyPaymentWebhook(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);

    const message = error instanceof Error ? error.message : "";
    const invalidSignature =
      message.includes("signature") ||
      message.includes("No signatures") ||
      message.includes("Invalid") ||
      message.includes("PAYMENT_WEBHOOK_SECRET") ||
      message.includes("PAYMENT_SECRET_KEY");

    if (invalidSignature) {
      return new Response("Invalid webhook", { status: 400 });
    }

    return new Response("Webhook processing failed", { status: 500 });
  }
}
