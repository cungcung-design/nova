import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";

import { getReport } from "@/services/report.service";

export async function GET(
  request: Request,
) {
  try {
    const workspace =
      await getCurrentWorkspace();

    const url =
      new URL(request.url);

    const range =
      url.searchParams.get("range");

    const days =
      range === "7"
        ? 7
        : range === "90"
          ? 90
          : 30;

    const report =
      await getReport(
        workspace.id,
        days,
      );

    return NextResponse.json(report);
  } catch (error) {
    console.error(
      "GET /api/reports",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load report.",
      },
      {
        status: 500,
      },
    );
  }
}