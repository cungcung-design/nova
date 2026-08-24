"use client";

import { Check, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";

import { billingPlans } from "@/config/billing";
import type { BillingInterval } from "@/types/billing";

type Props = {
  plan: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  canManage: boolean;
};

export function BillingClient({
  plan,
  status,
  cancelAtPeriodEnd,
  currentPeriodEnd,
  canManage,
}: Props) {
  const [loading, setLoading] = useState<"checkout" | "portal" | string | null>(
    null,
  );
  const [interval, setInterval] = useState<BillingInterval>("MONTH");

  async function handleChoosePlan(planId: string) {
    setLoading(planId);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          interval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Unable to start checkout.",
        );
      }

      window.location.assign(data.checkoutUrl ?? data.url);
    } catch (error) {
      console.error(error);
      setLoading(null);
      window.alert(
        error instanceof Error ? error.message : "Unable to start checkout.",
      );
    }
  }

  async function openPortal() {
    setLoading("portal");

    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to open billing portal.");
      }

      window.location.assign(data.url);
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

  const isPaid = plan === "PRO" || plan === "BUSINESS";
  const pastDue = status === "PAST_DUE";

  return (
    <div className="space-y-8">
      {pastDue && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-50 p-6 dark:bg-amber-950/20">
          <p className="font-semibold">Payment issue</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn&apos;t process your latest payment. Please update billing.
          </p>
          {canManage ? (
            <button
              type="button"
              onClick={() => void openPortal()}
              className="mt-4 inline-flex h-11 items-center rounded-xl bg-foreground px-4 text-sm font-medium text-background"
            >
              Manage billing
            </button>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Ask the workspace owner to update billing.
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border p-2.5">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current plan</p>
                <h2 className="text-xl font-semibold">
                  {plan === "BUSINESS" ? "Business" : isPaid ? "Pro" : "Free"}
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
                  {new Date(currentPeriodEnd).toISOString().split("T")[0]}
                </span>
              )}
            </div>
          </div>

          {isPaid && canManage ? (
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={loading !== null}
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "portal" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Manage billing
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex rounded-xl border bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => setInterval("MONTH")}
            className={`rounded-lg px-4 py-2 text-sm ${
              interval === "MONTH"
                ? "bg-background shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setInterval("YEAR")}
            className={`rounded-lg px-4 py-2 text-sm ${
              interval === "YEAR"
                ? "bg-background shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {(
          [
            billingPlans.FREE,
            billingPlans.PRO,
            billingPlans.BUSINESS,
          ] as const
        ).map((item) => {
          const current = plan === item.slug.toUpperCase();
          const price =
            interval === "YEAR" ? item.yearlyPrice : item.monthlyPrice;

          return (
            <div
              key={item.slug}
              className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm ${
                current ? "ring-2 ring-foreground" : ""
              }`}
            >
              {current && (
                <span className="absolute right-5 top-5 rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background">
                  Current
                </span>
              )}

              <h3 className="text-xl font-semibold">{item.name}</h3>
              <p className="mt-2 min-h-10 text-sm text-muted-foreground">
                {item.description}
              </p>

              <div className="mt-6">
                <span className="text-4xl font-bold">${price}</span>
                <span className="text-sm text-muted-foreground">
                  /{interval === "MONTH" ? "month" : "year"}
                </span>
              </div>

              <div className="my-6 h-px bg-border" />

              <div className="space-y-3 text-sm">
                {item.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {item.slug === "free" ? (
                <button
                  type="button"
                  disabled
                  className="mt-8 h-11 rounded-xl border px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {current ? "Current plan" : "Included"}
                </button>
              ) : canManage ? (
                <button
                  type="button"
                  disabled={current || loading !== null}
                  onClick={() => void handleChoosePlan(item.slug.toUpperCase())}
                  className="mt-8 h-11 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading === item.slug.toUpperCase() ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting...
                    </span>
                  ) : current ? (
                    "Current plan"
                  ) : (
                    "Choose plan"
                  )}
                </button>
              ) : (
                <p className="mt-8 text-sm text-muted-foreground">
                  Only the workspace owner can change the plan.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
