"use client";

import { Check, CreditCard, Loader2 } from "lucide-react";

import { useState } from "react";

type Props = {
  plan: string;

  status: string;

  cancelAtPeriodEnd: boolean;

  currentPeriodEnd: string | null;
};

const freeFeatures = [
  "Dashboard overview",
  "Basic analytics",
  "Up to 3 team members",
  "Basic reports",
];

const proFeatures = [
  "Everything in Free",
  "Unlimited team members",
  "Unlimited customers",
  "Advanced analytics",
  "Advanced reports",
  "Data export",
  "Priority support",
];

export function BillingClient({
  plan,
  status,
  cancelAtPeriodEnd,
  currentPeriodEnd,
}: Props) {
  const [loading, setLoading] = useState<
    "checkout" | "portal" | null
  >(null);

  async function checkout() {
    setLoading("checkout");

    try {
      const response = await fetch(
        "/api/billing/checkout",
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Unable to start checkout.",
        );
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);

      setLoading(null);

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to start checkout.",
      );
    }
  }

  async function openPortal() {
    setLoading("portal");

    try {
      const response = await fetch(
        "/api/billing/portal",
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Unable to open billing portal.",
        );
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);

      setLoading(null);

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to open billing portal.",
      );
    }
  }

  const isPro = plan === "PRO";

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border p-2.5">
                <CreditCard className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Current plan
                </p>

                <h2 className="text-xl font-semibold">
                  {isPro ? "Pro" : "Free"}
                </h2>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border px-3 py-1 text-xs font-medium">
                {status}
              </span>

              {cancelAtPeriodEnd && currentPeriodEnd && (
                <span className="rounded-full border px-3 py-1 text-xs font-medium">
                  Cancels on{" "}
                  {new Date(currentPeriodEnd).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {isPro ? (
            <button
              type="button"
              onClick={openPortal}
              disabled={loading !== null}
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "portal" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              Manage billing
            </button>
          ) : (
            <button
              type="button"
              onClick={checkout}
              disabled={loading !== null}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "checkout" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              Upgrade to Pro
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PlanCard
          name="Free"
          price="$0"
          description="Essential tools for getting started."
          features={freeFeatures}
          current={!isPro}
        />

        <PlanCard
          name="Pro"
          price="$29"
          description="Advanced tools for growing teams."
          features={proFeatures}
          current={isPro}
          highlighted
        />
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  description,
  features,
  current,
  highlighted,
}: {
  name: string;

  price: string;

  description: string;

  features: string[];

  current: boolean;

  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card p-6 shadow-sm ${
        highlighted ? "ring-1 ring-foreground/10" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            {name}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        {current && (
          <span className="rounded-full border px-3 py-1 text-xs font-medium">
            Current
          </span>
        )}
      </div>

      <div className="mt-6">
        <span className="text-3xl font-semibold">
          {price}
        </span>

        {price !== "$0" && (
          <span className="text-sm text-muted-foreground">
            /month
          </span>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-3 text-sm"
          >
            <Check className="h-4 w-4 shrink-0" />

            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
