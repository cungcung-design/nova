import Link from "next/link";

export default function BillingSuccessPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border">
          ✓
        </div>

        <h1 className="mt-6 text-3xl font-semibold">Payment successful</h1>

        <p className="mt-3 text-muted-foreground">
          Your payment was received. Your subscription will be updated once the
          payment provider confirms the webhook.
        </p>

        <Link
          href="/dashboard/settings/billing"
          className="mt-8 inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-medium text-background"
        >
          Return to billing
        </Link>
      </div>
    </div>
  );
}
