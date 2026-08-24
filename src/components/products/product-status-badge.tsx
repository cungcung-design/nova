import { ProductStatus } from "@prisma/client";

type Props = {
  status: ProductStatus | string;
};

export function ProductStatusBadge({
  status,
}: Props) {
  const styles: Record<string, string> = {
    ACTIVE: "border-green-200 text-green-700",
    INACTIVE: "border-muted text-muted-foreground",
    OUT_OF_STOCK: "border-red-200 text-red-700",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs ${
        styles[status] ?? "border-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}
