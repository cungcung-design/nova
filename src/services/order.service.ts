import { db } from "@/lib/db";
import { toNumber } from "@/lib/utils";
import type { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

type OrderFilters = {
  workspaceId: string;
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  paymentStatus?: string;
};

export async function getOrders({
  workspaceId,
  search,
  status,
  page = 1,
  pageSize = 25,
  sortBy = "createdAt",
  sortDirection = "desc",
  paymentStatus,
}: OrderFilters) {
  const allowedSortFields = ["createdAt", "total", "status", "orderNumber"] as const;
  const safeSortBy = allowedSortFields.includes(sortBy as (typeof allowedSortFields)[number])
    ? sortBy
    : "createdAt";

  const safeSortDirection = sortDirection === "asc" ? "asc" : "desc";

  const where: Prisma.OrderWhereInput = {
    workspaceId,
    ...(status ? { status: status as OrderStatus } : {}),
    ...(paymentStatus ? { paymentStatus: paymentStatus as PaymentStatus } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
            { customer: { email: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { [safeSortBy]: safeSortDirection },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.order.count({ where }),
  ]);

  return {
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      customer: {
        name: order.customer?.name ?? "",
        email: order.customer?.email ?? null,
      },
      subtotal: toNumber(order.subtotal),
      tax: toNumber(order.tax),
      discount: toNumber(order.discount),
      total: toNumber(order.total),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getOrderById(workspaceId: string, orderId: string) {
  return db.order.findFirst({
    where: { id: orderId, workspaceId },
    include: { customer: true, items: { include: { product: true } }, transactions: true },
  });
}

type OrderItemInput = {
  productId: string;
  quantity: number;
};

type CreateOrderInput = {
  customerId: string;
  items: OrderItemInput[];
  tax: number;
  discount: number;
  notes?: string;
};

export async function createOrder(workspaceId: string, input: CreateOrderInput) {
  return db.$transaction(async (tx) => {
    const customer = await tx.customer.findFirst({
      where: { id: input.customerId, workspaceId },
    });
    if (!customer) throw new Error("Customer not found.");

    const products = await tx.product.findMany({
      where: { id: { in: input.items.map((item) => item.productId) }, workspaceId },
    });
    if (products.length !== input.items.length) {
      throw new Error("One or more products were not found.");
    }

    let subtotal = 0;
    const items = input.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Product not found.");
      if (product.stock < item.quantity) {
        throw new Error(`${product.name} does not have enough stock.`);
      }
      const price = Number(product.price);
      const total = price * item.quantity;
      subtotal += total;
      return { productId: product.id, quantity: item.quantity, price, total };
    });

    const total = subtotal + input.tax - input.discount;

    const order = await tx.order.create({
      data: {
        workspaceId,
        customerId: input.customerId,
        orderNumber: generateOrderNumber(),
        subtotal,
        tax: input.tax,
        discount: input.discount,
        total,
        notes: input.notes,
        items: { create: items },
      },
      include: { customer: true, items: { include: { product: true } } },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return order;
  });
}

function generateOrderNumber() {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

export async function updateOrderStatus(workspaceId: string, orderId: string, status: OrderStatus) {
  return db.order.updateMany({
    where: { id: orderId, workspaceId },
    data: { status },
  });
}

export async function bulkUpdateOrders(workspaceId: string, ids: string[], action: string) {
  if (action === "cancel") {
    return db.order.updateMany({
      where: { id: { in: ids }, workspaceId },
      data: { status: "CANCELLED" },
    });
  }

  throw new Error(`Unsupported bulk action: ${action}`);
}
