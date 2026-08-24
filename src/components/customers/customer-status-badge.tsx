"use client";

type CustomerStatusBadgeProps = {
  status: string;
};

export function CustomerStatusBadge({
  status,
}: CustomerStatusBadgeProps) {
  const styles: Record<string, string> = {
    ACTIVE: "border-green-500 text-green-700 dark:text-green-400",
    INACTIVE: "border-gray-500 text-gray-700 dark:text-gray-300",
    LEAD: "border-blue-500 text-blue-700 dark:text-blue-400",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? "border-gray-500 text-gray-700 dark:text-gray-300"
      }`}
    >
      {status}
    </span>
  );
}
