import { NextResponse } from "next/server";

import { apiErrorResponse } from "@/lib/api-error";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import {
  createExportJob,
  getExportJob,
  listExportJobs,
  serializeExportJob,
} from "@/lib/export/export-service";
import { requireExportAccess } from "@/lib/export/permissions";
import { processExport } from "@/lib/export/processor";
import { isExportFormat, isExportResource } from "@/lib/export/validation";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export async function GET() {
  try {
    const workspace = await getCurrentWorkspace();
    await requireExportAccess(workspace.id);

    const jobs = await listExportJobs(workspace.id);

    return NextResponse.json({
      jobs: jobs.map(serializeExportJob),
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to load export history.");
  }
}

export async function POST(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();
    const body = await request.json();

    if (!isExportResource(body.resource)) {
      return NextResponse.json(
        { message: "Invalid export resource.", error: "Invalid export resource." },
        { status: 400 },
      );
    }

    if (!isExportFormat(body.format)) {
      return NextResponse.json(
        { message: "Invalid export format.", error: "Invalid export format." },
        { status: 400 },
      );
    }

    await requireExportAccess(workspace.id, body.resource);

    const limited = await rateLimit(
      `export:${workspace.id}:${workspace.userId}`,
      20,
      60,
    );

    if (!limited.success) {
      return rateLimitResponse(
        "Too many export requests. Please try again later.",
      );
    }

    const filters =
      body.filters && typeof body.filters === "object" && !Array.isArray(body.filters)
        ? (body.filters as Record<string, unknown>)
        : {};

    const job = await createExportJob({
      workspaceId: workspace.id,
      resource: body.resource,
      format: body.format,
      filters,
    });

    try {
      const processed = await processExport(job.id, workspace.userId);
      return NextResponse.json(
        { job: serializeExportJob(processed.job) },
        { status: 201 },
      );
    } catch (error) {
      const current = await getExportJob(workspace.id, job.id);

      return NextResponse.json(
        {
          job: serializeExportJob(current ?? job),
          message:
            error instanceof Error ? error.message : "Unable to create export.",
        },
        { status: 201 },
      );
    }
  } catch (error) {
    return apiErrorResponse(error, "Unable to create export.");
  }
}
