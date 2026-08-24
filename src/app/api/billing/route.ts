import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";

import { getWorkspaceSubscription } from "@/services/billing.service";

export async function GET() {
  try {
    const workspace =
      await getCurrentWorkspace();

    const subscription =
      await getWorkspaceSubscription(
        workspace.id,
      );

    return NextResponse.json({
      subscription,
    });
  } catch (error) {
    console.error("GET /api/billing", error);

    return NextResponse.json(
      {
        error: "Unable to load billing information.",
      },
      {
        status: 500,
      },
    );
  }
}
