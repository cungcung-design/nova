import { db } from "@/lib/db";
import { generateOrderNumber } from "@/lib/order-number";

type OrderFilters = {
  workspaceId: string;
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export async function getOrders({
  workspaceId,
  search,
  status,
  page = 1,
  pageSize = 10,
}: OrderFilters) {
  const where = {
    workspaceId,

    ...(status && {
      status: status as any,
    }),

    ...(search && {
      OR: [
        {
          orderNumber: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
        {
          customer: {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        },
        {
          customer: {
            email: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        },
      ],
    }),
  };

  const [orders, total] =
    await Promise.all([
      db.order.findMany({
        where,
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),

      db.order.count({
        where,
      }),
    ]);

  return {
    orders,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(
      total / pageSize,
    ),
  };
}

export async function createOrder(
  workspaceId: string,
  input: {
    customerId: string;
    items: {
      productId: string;
      quantity: number;
    }[];
    tax: number;
    discount: number;
    notes?: string;
  },
) {
  return db.$transaction(async (tx) => {
    const customer =
      await tx.customer.findFirst({
        where: {
          id: input.customerId,
          workspaceId,
        },
      });

    if (!customer) {
      throw new Error(
        "Customer not found.",
      );
    }

    const products =
      await tx.product.findMany({
        where: {
          id: {
            in: input.items.map(
              (item) => item.productId,
            ),
          },
          workspaceId,
        },
      });

    if (
      products.length !==
      input.items.length
    ) {
      throw new Error(
        "One or more products were not found.",
      );
    }

    let subtotal = 0;

    const items = input.items.map(
      (item) => {
        const product =
          products.find(
            (p) =>
              p.id === item.productId,
          );

        if (!product) {
          throw new Error(
            "Product not found.",
          );
        }

        if (
          product.stock <
          item.quantity
        ) {
          throw new Error(
            `${product.name} does not have enough stock.`,
          );
        }

        const price =
          Number(product.price);

        const total =
          price * item.quantity;

        subtotal += total;

        return {
          productId: product.id,
          quantity: item.quantity,
          price,
          total,
        };
      },
    );

    const total =
      subtotal +
      input.tax -
      input.discount;

    const order =
      await tx.order.create({
        data: {
          workspaceId,
          customerId: input.customerId,

          orderNumber:
            generateOrderNumber(),

          subtotal,
          tax: input.tax,
          discount: input.discount,
          total,

          notes: input.notes,

          items: {
            create: items,
          },
        },

        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

    for (const item of items) {
      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            decrement:
              item.quantity,
          },
        },
      });
    }

    return order;
  });
}

export async function getOrderById(
  workspaceId: string,
  orderId: string,
) {
  return db.order.findFirst({
    where: {
      id: orderId,
      workspaceId,
    },

    include: {
      customer: true,

      items: {
        include: {
          product: true,
        },
      },

      transaction: true,
    },
  });
}

export async function updateOrderStatus(
  workspaceId: string,
  orderId: string,
  status: any,
) {
  return db.order.updateMany({
    where: {
      id: orderId,
      workspaceId,
    },

    data: {
      status,
    },
  });
}
