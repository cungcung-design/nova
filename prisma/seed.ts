import bcrypt from "bcryptjs";

import dotenv from "dotenv";

dotenv.config({ path: ".env" });

import {
  UserRole,
  WorkspacePlan,
  CustomerStatus,
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  TransactionStatus,
  PrismaClient,
} from "@prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: {
      email: "john@nova.dev",
    },
    update: {},
    create: {
      email: "john@nova.dev",
      name: "John Doe",
      passwordHash,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: {
      slug: "acme",
    },
    update: {},
    create: {
      name: "Acme Corporation",
      slug: "acme",
      plan: WorkspacePlan.PRO,
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspace.id,
      },
    },
    update: {
      role: UserRole.OWNER,
    },
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      role: UserRole.OWNER,
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    },
    update: {
      role: "OWNER",
    },
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: "OWNER",
    },
  });

  const customerNames = [
    "Sarah Lee",
    "Alex Kim",
    "David Tan",
    "Michael Wong",
    "Emma Lim",
    "Daniel Lee",
    "Sophia Tan",
    "James Wong",
  ];

  for (const name of customerNames) {
    const email = `${name
      .toLowerCase()
      .replace(" ", ".")}@example.com`;

    await prisma.customer.upsert({
      where: {
        id: `${workspace.id}-${email}`,
      },
      update: {},
      create: {
        id: `${workspace.id}-${email}`,
        name,
        email,
        status: CustomerStatus.ACTIVE,
        workspaceId: workspace.id,
        createdById: user.id,
      },
    });
  }

  const products = [
    {
      name: "Professional Plan",
      sku: "NOVA-PRO",
      price: 99,
      stock: 100,
    },
    {
      name: "Business Plan",
      sku: "NOVA-BUSINESS",
      price: 249,
      stock: 100,
    },
    {
      name: "Analytics Add-on",
      sku: "NOVA-ANALYTICS",
      price: 49,
      stock: 100,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        id: `${workspace.id}-${product.sku}`,
      },
      update: {},
      create: {
        id: `${workspace.id}-${product.sku}`,
        name: product.name,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        status: ProductStatus.ACTIVE,
        workspaceId: workspace.id,
      },
    });
  }

  const dbProducts = await prisma.product.findMany({
    where: {
      workspaceId: workspace.id,
    },
  });

  const customers = await prisma.customer.findMany({
    where: {
      workspaceId: workspace.id,
    },
  });

  for (let i = 0; i < 20; i++) {
    const customer = customers[i % customers.length];
    const product = dbProducts[i % dbProducts.length];

    const amount = Number(product.price);

    const subtotal = amount;
    const tax = 0;
    const discount = 0;
    const total = subtotal + tax - discount;

    const existingOrder = await prisma.order.findFirst({
      where: {
        orderNumber: `ORD-${1000 + i}`,
      },
    });

    if (existingOrder) {
      continue;
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${1000 + i}`,
        status:
          i % 5 === 0
            ? OrderStatus.PENDING
            : OrderStatus.COMPLETED,
        paymentStatus:
          i % 5 === 0
            ? PaymentStatus.PENDING
            : PaymentStatus.PAID,
        subtotal,
        tax,
        discount,
        total,
        workspaceId: workspace.id,
        customerId: customer.id,

        items: {
          create: {
            quantity: 1,
            price: product.price,
            total: amount,
            productId: product.id,
          },
        },
      },
    });

    await prisma.transaction.create({
      data: {
        amount,
        status:
          i % 5 === 0
            ? TransactionStatus.PENDING
            : TransactionStatus.COMPLETED,
        workspaceId: workspace.id,
        orderId: order.id,
        customerId: customer.id,
      },
    });
  }

  console.log("NOVA database seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
