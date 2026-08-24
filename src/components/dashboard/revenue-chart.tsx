"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  RevenuePoint,
} from "@/types/analytics";

type Props = {
  data: RevenuePoint[];
};

function formatCurrency(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  );
}

export function RevenueChart({
  data,
}: Props) {
  const [active, setActive] =
    useState<number | null>(null);

  const width = 1000;
  const height = 320;

  const paddingX = 24;
  const paddingY = 30;

  const maxValue =
    Math.max(
      ...data.map(
        (item) => item.revenue,
      ),
      1,
    );

  const points = useMemo(() => {
    if (data.length === 1) {
      return [
        {
          x: width / 2,
          y:
            height -
            paddingY,
        },
      ];
    }

    return data.map(
      (item, index) => {
        const x =
          paddingX +
          (index /
            (data.length - 1)) *
            (width -
              paddingX * 2);

        const y =
          height -
          paddingY -
          (item.revenue /
            maxValue) *
            (height -
              paddingY * 2);

        return {
          x,
          y,
        };
      },
    );
  }, [data, maxValue]);

  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
    )
    .join(" ");

  const areaPath = `${path} L ${
    width - paddingX
  } ${height - paddingY} L ${paddingX} ${
    height - paddingY
  } Z`;

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold">
            Revenue Overview
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Revenue generated from completed payments.
          </p>
        </div>

        {active !== null &&
          data[active] && (
            <div className="rounded-xl border bg-background px-4 py-2 text-right">
              <p className="text-xs text-muted-foreground">
                {formatDate(
                  data[active].date,
                )}
              </p>

              <p className="font-semibold">
                {formatCurrency(
                  data[active].revenue,
                )}
              </p>
            </div>
          )}
      </div>

      <div className="mt-8 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          role="img"
          aria-label="Revenue chart"
        >
          {[0, 1, 2, 3, 4].map(
            (line) => {
              const y =
                paddingY +
                (line / 4) *
                  (height -
                    paddingY * 2);

              return (
                <line
                  key={line}
                  x1={paddingX}
                  x2={
                    width -
                    paddingX
                  }
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-border"
                  strokeDasharray="4 8"
                />
              );
            },
          )}

          <path
            d={areaPath}
            fill="currentColor"
            className="text-muted/40"
          />

          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          />

          {points.map(
            (point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={
                    active === index
                      ? 6
                      : 4
                  }
                  fill="currentColor"
                  className="text-foreground"
                />

                <rect
                  x={point.x - 12}
                  y={0}
                  width={24}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setActive(index)
                  }
                  onMouseLeave={() =>
                    setActive(null)
                  }
                />
              </g>
            ),
          )}
        </svg>
      </div>

      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        {data.length > 0 && (
          <>
            <span>
              {formatDate(
                data[0].date,
              )}
            </span>

            <span>
              {formatDate(
                data[
                  data.length - 1
                ].date,
              )}
            </span>
          </>
        )}
      </div>
    </section>
  );
}