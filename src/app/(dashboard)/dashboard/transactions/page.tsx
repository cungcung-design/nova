import { ExportButton } from "@/components/export/export-button";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { getTransactions } from "@/services/transaction.service";

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
    page?: string;
  }>;
};

export default async function TransactionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const workspace = await getCurrentWorkspace();
  await requireRole(workspace.id, [...permissions.orders.view]);

  const result = await getTransactions({
    workspaceId: workspace.id,
    search: params.search,
    status: params.status,
    type: params.type,
    page: Math.max(1, Number(params.page ?? "1")),
    pageSize: 25,
  });

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Business</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Transactions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Payment history and transaction records.
          </p>
        </div>

        <ExportButton resource="TRANSACTIONS" />
      </div>

      <TransactionsTable
        transactions={result.transactions}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        search={params.search}
        status={params.status}
      />
    </div>
  );
}
