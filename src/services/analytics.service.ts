import { db } from "@/lib/db";
import { toNumber } from "@/lib/utils";

type AnalyticsRange = 7 | 30 | 90;

function getStartDate(days: AnalyticsRange) {
  const date = new Date();

  date.setDate(date.getDate() - days);

  date.setHours(0, 0, 0, 0);

  return date;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createDateRange(days: AnalyticsRange) {
  const dates: string[] = [];

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);

    date.setDate(today.getDate() - i);

    dates.push(formatDate(date));
  }

  return dates;
}

export async function getAnalytics(
  workspaceId: string,
  days: AnalyticsRange = 30,
) {
  const startDate = getStartDate(days);

  const previousStartDate = new Date(startDate);

  previousStartDate.setDate(
    previousStartDate.getDate() - days,
  );

  const [
    currentPayments,
    previousPayments,
    currentOrders,
    previousOrders,
    currentCustomers,
    previousCustomers,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    /*
     * Current revenue
     */
    db.transaction.aggregate({
      where: {
        workspaceId,

        type: "PAYMENT",

        status: "COMPLETED",

        createdAt: {
          gte: startDate,
        },
      },

      _sum: {
        amount: true,
      },
    }),

    /*
     * Previous-period revenue
     */
    db.transaction.aggregate({
      where: {
        workspaceId,

        type: "PAYMENT",

        status: "COMPLETED",

        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },

      _sum: {
        amount: true,
      },
    }),

    /*
     * Current orders
     */
    db.order.count({
      where: {
        workspaceId,

        createdAt: {
          gte: startDate,
        },
      },
    }),

    /*
     * Previous orders
     */
    db.order.count({
      where: {
        workspaceId,

        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    }),

    /*
     * Current customers
     */
    db.customer.count({
      where: {
        workspaceId,

        createdAt: {
          gte: startDate,
        },
      },
    }),

    /*
     * Previous customers
     */
    db.customer.count({
      where: {
        workspaceId,

        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    }),

    /*
     * Recent orders
     */
    db.order.findMany({
      where: {
        workspaceId,
      },

      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 8,
    }),

    /*
     * Top products
     */
    db.orderItem.findMany({
      where: {
        order: {
          workspaceId,

          createdAt: {
            gte: startDate,
          },
        },
      },

      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  const revenue = Number(
    currentPayments._sum.amount ?? 0,
  );

  const previousRevenue = Number(
    previousPayments._sum.amount ?? 0,
  );

  const revenueGrowth =
    calculateGrowth(
      revenue,
      previousRevenue,
    );

  const orderGrowth =
    calculateGrowth(
      currentOrders,
      previousOrders,
    );

  const customerGrowth =
    calculateGrowth(
      currentCustomers,
      previousCustomers,
    );

  const averageOrderValue =
    currentOrders > 0
      ? revenue / currentOrders
      : 0;

  /*
   * Aggregate top products.
   */
  const productMap = new Map<
    string,
    {
      id: string;
      name: string;
      quantity: number;
      revenue: number;
    }
  >();

  for (const item of topProducts) {
    const productId = item.product.id;

    const existing =
      productMap.get(productId);

    const quantity = Number(
      item.quantity,
    );

    /*
     * Adjust this calculation if your
     * OrderItem model uses a different
     * price field.
     */
    const itemPrice = Number(
      item.price,
    );

    const itemRevenue =
      itemPrice * quantity;

    if (existing) {
      existing.quantity += quantity;

      existing.revenue +=
        itemRevenue;
    } else {
      productMap.set(productId, {
        id: productId,
        name: item.product.name,
        quantity,
        revenue: itemRevenue,
      });
    }
  }

  const products = Array.from(
    productMap.values(),
  )
    .sort(
      (a, b) =>
        b.revenue - a.revenue,
    )
    .slice(0, 5);

  /*
   * Build daily revenue chart.
   */
  const chartDates =
    createDateRange(days);

  const chartMap = new Map<
    string,
    number
  >();

  for (const date of chartDates) {
    chartMap.set(date, 0);
  }

  const chartTransactions =
    await db.transaction.findMany({
      where: {
        workspaceId,

        type: "PAYMENT",

        status: "COMPLETED",

        createdAt: {
          gte: startDate,
        },
      },

      select: {
        amount: true,
        createdAt: true,
      },
    });

  for (const transaction of chartTransactions) {
    const date = formatDate(
      transaction.createdAt,
    );

    const current =
      chartMap.get(date) ?? 0;

    chartMap.set(
      date,
      current +
        Number(transaction.amount),
    );
  }

  const revenueChart =
    chartDates.map((date) => ({
      date,

      revenue:
        chartMap.get(date) ?? 0,
    }));

  return {
    summary: {
      revenue,
      revenueGrowth,

      orders: currentOrders,
      orderGrowth,

      customers: currentCustomers,
      customerGrowth,

      averageOrderValue,
    },

    revenueChart,

    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      total: toNumber(order.total),
      status: order.status,
      createdAt: order.createdAt,
      customer: order.customer,
    })),

    topProducts: products,
  };
}

function calculateGrowth(
  current: number,
  previous: number,
) {
  if (previous === 0) {
    if (current === 0) {
      return 0;
    }

    return 100;
  }

  return (
    ((current - previous) /
      previous) *
    100
  );
}