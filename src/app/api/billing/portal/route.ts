import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";

import {
  createBillingPortalSession,
} from "@/services/billing.service";

export async function POST() {
  try {
    const workspace =
      await getCurrentWorkspace();

    const session =
      await createBillingPortalSession(
        workspace.id,
      );

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error(
      "POST /api/billing/portal",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to open billing portal.",
      },
      {
        status: 500,
      },
    );
  }
}
