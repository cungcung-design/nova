export type ExportFormat =
  | "csv";

export type ExportScope =
  | "selected"
  | "filtered";

export type ExportRequest = {
  format: ExportFormat;
  scope: ExportScope;
  ids?: string[];
  search?: string;
};
