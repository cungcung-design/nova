import { ActivityType, AuditAction, NotificationType } from "@prisma/client";

import { db } from "@/lib/db";
import { createCsv } from "@/lib/export/csv";
import { saveExportFile } from "@/lib/export/storage";
import { getAnalyticsForExport } from "@/lib/export/resources/analytics";
import { getCustomersForExport } from "@/lib/export/resources/customers";
import { getOrdersForExport } from "@/lib/export/resources/orders";
import { getProductsForExport } from "@/lib/export/resources/products";
import { getTransactionsForExport } from "@/lib/export/resources/transactions";
import { createActivity } from "@/services/activity.service";
import { createNotification } from "@/services/notification.service";

function asFilterRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

export async function processExport(jobId: string, userId?: string) {
  const job = await db.exportJob.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error("Export job not found.");
  }

  await db.exportJob.update({
    where: { id: job.id },
    data: { status: "PROCESSING" },
  });

  try {
    if (job.format !== "CSV") {
      throw new Error("This export format is not yet enabled for this processor.");
    }

    const filters = asFilterRecord(job.filters);
    let rows: Record<string, unknown>[] = [];

    switch (job.resource) {
      case "ORDERS":
        rows = await getOrdersForExport(job.workspaceId, filters);
        break;
      case "CUSTOMERS":
        rows = await getCustomersForExport(job.workspaceId, filters);
        break;
      case "PRODUCTS":
        rows = await getProductsForExport(job.workspaceId, filters);
        break;
      case "TRANSACTIONS":
        rows = await getTransactionsForExport(job.workspaceId, filters);
        break;
      case "ANALYTICS":
        rows = await getAnalyticsForExport(job.workspaceId, filters);
        break;
      default:
        throw new Error(`Unsupported resource: ${job.resource}`);
    }

    const csv = createCsv(rows);
    const fileName = `${job.resource.toLowerCase()}-${job.id}.csv`;
    await saveExportFile(job.id, fileName, csv);

    const fileUrl = `/api/exports/${job.id}/download`;

    const completed = await db.exportJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        fileName,
        fileUrl,
        completedAt: new Date(),
      },
    });

    try {
      await db.auditLog.create({
        data: {
          workspaceId: job.workspaceId,
          userId,
          action: AuditAction.EXPORT_DATA,
          entity: job.resource,
          entityId: job.id,
          description: `Exported ${rows.length} ${job.resource.toLowerCase()} records.`,
          metadata: {
            jobId: job.id,
            format: job.format,
            count: rows.length,
          },
        },
      });

      await createActivity({
        workspaceId: job.workspaceId,
        userId,
        type: ActivityType.REPORT_GENERATED,
        title: "Exported workspace data",
        description: `${job.resource} export completed (${job.format}).`,
        metadata: {
          jobId: job.id,
          resource: job.resource,
          format: job.format,
        },
      });

      if (userId) {
        await createNotification({
          userId,
          workspaceId: job.workspaceId,
          type: NotificationType.SUCCESS,
          title: "Export completed",
          message: `Your ${job.resource.toLowerCase()} report is ready to download.`,
          link: `/dashboard/exports?job=${job.id}`,
        });
      }
    } catch (sideEffectError) {
      console.error("Export side effects failed:", sideEffectError);
    }

    return {
      csv,
      fileName,
      job: completed,
    };
  } catch (error) {
    await db.exportJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        errorMessage:
          error instanceof Error ? error.message : "Unknown export error.",
        completedAt: new Date(),
      },
    });

    throw error;
  }
}
