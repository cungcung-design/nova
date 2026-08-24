import { db } from "@/lib/db";

type ReportRange = 7 | 30 | 90;

function getStartDate(days: ReportRange) {
  const date = new Date();

  date.setDate(date.getDate() - days);

  date.setHours(0, 0, 0, 0);

  return date;
}

function calculateGrowth(
  current: number,
  previous: number,
) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

type ProductReport = {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
};

export async function getReport(
  workspaceId: string,
  days: ReportRange = 30,
) {
  const startDate = getStartDate(days);

  const previousStartDate = new Date(startDate);

  previousStartDate.setDate(
    previousStartDate.getDate() - days,
  );

  const [
    revenue,
    previousRevenue,
    orders,
    previousOrders,
    customers,
    previousCustomers,
    orderStatuses,
    newCustomers,
    previousCustomersList,
    customerOrders,
    products,
  ] = await Promise.all([
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

    db.order.count({
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
        },
      },
    }),

    db.order.count({
      where: {
        workspaceId,
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    }),

    db.customer.count({
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
        },
      },
    }),

    db.customer.count({
      where: {
        workspaceId,
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    }),

    db.order.groupBy({
      by: ["status"],
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        _all: true,
      },
    }),

    db.customer.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
      },
    }),

    db.customer.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      select: {
        id: true,
      },
    }),

    db.order.findMany({
      where: {
        workspaceId,
      },
      select: {
        customerId: true,
      },
    }),

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

  const totalRevenue = Number(
    revenue._sum.amount ?? 0,
  );

  const oldRevenue = Number(
    previousRevenue._sum.amount ?? 0,
  );

  const averageOrderValue =
    orders > 0
      ? totalRevenue / orders
      : 0;

  const customerOrderMap =
    new Map<string, number>();

  for (const order of customerOrders) {
    customerOrderMap.set(
      order.customerId,
      (customerOrderMap.get(
        order.customerId,
      ) ?? 0) + 1,
    );
  }

  const returningCustomers =
    newCustomers.filter(
      (customer) =>
        (customerOrderMap.get(
          customer.id,
        ) ?? 0) > 1,
    ).length;

  const productMap = new Map<
    string,
    ProductReport
  >();

  for (const item of products) {
    const id = item.product.id;

    const quantity = Number(
      item.quantity,
    );

    const price = Number(
      item.price,
    );

    const existing =
      productMap.get(id);

    if (existing) {
      existing.unitsSold += quantity;
      existing.revenue +=
        quantity * price;
    } else {
      productMap.set(id, {
        id,
        name: item.product.name,
        unitsSold: quantity,
        revenue: quantity * price,
      });
    }
  }

  const productPerformance =
    Array.from(
      productMap.values(),
    )
      .sort(
        (a, b) =>
          b.revenue - a.revenue,
      )
      .slice(0, 10);

  const statusBreakdown =
    orderStatuses.map((item) => ({
      status: String(item.status),
      count: item._count._all,
    }));

  const revenueTransactions =
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

  const revenueMap =
    new Map<string, number>();

  for (
    let i = 0;
    i < days;
    i++
  ) {
    const date = new Date();

    date.setDate(
      date.getDate() -
        (days - 1 - i),
    );

    date.setHours(0, 0, 0, 0);

    revenueMap.set(
      formatDate(date),
      0,
    );
  }

  for (
    const transaction of revenueTransactions
  ) {
    const date = formatDate(
      transaction.createdAt,
    );

    revenueMap.set(
      date,
      (revenueMap.get(date) ?? 0) +
        Number(transaction.amount),
    );
  }

  return {
    summary: {
      revenue: totalRevenue,
      revenueGrowth: calculateGrowth(
        totalRevenue,
        oldRevenue,
      ),

      orders,
      ordersGrowth: calculateGrowth(
        orders,
        previousOrders,
      ),

      customers,
      customersGrowth: calculateGrowth(
        customers,
        previousCustomers,
      ),

      averageOrderValue,
    },

    orderStatus: statusBreakdown,

    customers: {
      newCustomers: newCustomers.length,
      returningCustomers,
    },

    products: productPerformance,

    revenueByDay: Array.from(
      revenueMap.entries(),
    ).map(([date, value]) => ({
      date,
      revenue: value,
    })),
  };
}