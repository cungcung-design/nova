import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";

import { createCheckoutSession } from "@/services/billing.service";

export async function POST() {
  try {
    const workspace =
      await getCurrentWorkspace();

    const session =
      await createCheckoutSession(
        workspace.id,
        workspace.name,
        workspace.userId,
      );

    if (!session.url) {
      return NextResponse.json(
        {
          error: "Unable to create checkout session.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error(
      "POST /api/billing/checkout",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start checkout.",
      },
      {
        status: 500,
      },
    );
  }
}
