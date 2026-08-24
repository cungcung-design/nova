import { NextResponse } from "next/server";

import { apiErrorResponse } from "@/lib/api-error";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { getExportJob } from "@/lib/export/export-service";
import { requireExportAccess } from "@/lib/export/permissions";
import { readExportFile } from "@/lib/export/storage";
import { isExportResource } from "@/lib/export/validation";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const workspace = await getCurrentWorkspace();
    const { id } = await params;
    const job = await getExportJob(workspace.id, id);

    if (!job) {
      return NextResponse.json(
        { error: "Export not found." },
        { status: 404 },
      );
    }

    if (isExportResource(job.resource)) {
      await requireExportAccess(workspace.id, job.resource);
    } else {
      await requireExportAccess(workspace.id);
    }

    if (job.status !== "COMPLETED" || !job.fileName) {
      return NextResponse.json(
        { error: "Export is not ready to download." },
        { status: 409 },
      );
    }

    const contents = await readExportFile(`${job.id}.csv`);

    return new NextResponse(Uint8Array.from(contents), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${job.fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to download export.");
  }
}
