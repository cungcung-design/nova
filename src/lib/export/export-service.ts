import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import type { ExportFormat, ExportRecord, ExportResource } from "@/types/export";

type CreateExportInput = {
  workspaceId: string;
  resource: ExportResource;
  format: ExportFormat;
  filters?: Record<string, unknown>;
};

export async function createExportJob(input: CreateExportInput) {
  return db.exportJob.create({
    data: {
      workspaceId: input.workspaceId,
      resource: input.resource,
      format: input.format,
      status: "PENDING",
      filters: (input.filters ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function listExportJobs(workspaceId: string) {
  return db.exportJob.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getExportJob(workspaceId: string, jobId: string) {
  return db.exportJob.findFirst({
    where: {
      id: jobId,
      workspaceId,
    },
  });
}

export function serializeExportJob(job: {
  id: string;
  resource: string;
  format: string;
  status: string;
  fileName: string | null;
  fileUrl: string | null;
  errorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
}): ExportRecord {
  return {
    id: job.id,
    resource: job.resource as ExportResource,
    format: job.format as ExportFormat,
    status: job.status as ExportRecord["status"],
    fileName: job.fileName,
    fileUrl: job.fileUrl,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt.toISOString(),
    completedAt: job.completedAt?.toISOString() ?? null,
  };
}
