import Link from "next/link";

export default function RootPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <main className="flex w-full max-w-lg flex-col items-center gap-8 py-24 text-center sm:items-start sm:text-left">
        <div className="space-y-3">
          <p className="text-sm font-medium tracking-wide text-zinc-500">
            NOVA
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Modern business management
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Customers, products, orders, and reporting for your workspace.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
          >
            Create an account
          </Link>
        </div>
      </main>
    </div>
  );
}
