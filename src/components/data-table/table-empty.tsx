import { SearchX } from "lucide-react";

type TableEmptyProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export function TableEmpty({
  title = "No results found",
  description = "Try changing your search or filters.",
  action,
}: TableEmptyProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted/50">
        <SearchX className="h-5 w-5 text-muted-foreground" />
      </div>

      <h3 className="mt-4 text-sm font-semibold">{title}</h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
