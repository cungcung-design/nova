export type TableExportFormat = "csv";

export type ExportFormat = "CSV" | "XLSX" | "PDF";

export type ExportResource =
  | "ORDERS"
  | "CUSTOMERS"
  | "PRODUCTS"
  | "TRANSACTIONS"
  | "ANALYTICS";

export type ExportStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type ExportRecord = {
  id: string;
  resource: ExportResource;
  format: ExportFormat;
  status: ExportStatus;
  fileName: string | null;
  fileUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type ExportScope = "selected" | "filtered";

export type ExportRequest = {
  format: TableExportFormat;
  scope: ExportScope;
  ids?: string[];
  search?: string;
};
