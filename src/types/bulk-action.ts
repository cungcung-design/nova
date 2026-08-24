export type BulkAction =
  | "archive"
  | "restore"
  | "delete";

export type BulkActionRequest = {
  ids: string[];
  action: BulkAction;
};
