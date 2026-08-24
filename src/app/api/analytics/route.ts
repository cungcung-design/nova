import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";

import {
  getAnalytics,
} from "@/services/analytics.service";

export async function GET(
  request: Request,
) {
  try {
    const workspace =
      await getCurrentWorkspace();

    const url =
      new URL(request.url);

    const range =
      url.searchParams.get(
        "range",
      );

    const days =
      range === "7"
        ? 7
        : range === "90"
          ? 90
          : 30;

    const analytics =
      await getAnalytics(
        workspace.id,
        days,
      );

    return NextResponse.json(
      analytics,
    );
  } catch (error) {
    console.error(
      "GET /api/analytics",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load analytics.",
      },
      {
        status: 500,
      },
    );
  }
}