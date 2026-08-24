import bcrypt from "bcryptjs";

import dotenv from "dotenv";

dotenv.config({ path: ".env" });

import { UserRole, WorkspacePlan, PrismaClient } from "@prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const DEMO_ORDER_NUMBERS = Array.from(
  { length: 20 },
  (_, index) => `ORD-${1000 + index}`,
);

const DEMO_PRODUCT_SKUS = ["NOVA-PRO", "NOVA-BUSINESS", "NOVA-ANALYTICS"];

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

  await prisma.order.deleteMany({
    where: {
      workspaceId: workspace.id,
      orderNumber: {
        in: DEMO_ORDER_NUMBERS,
      },
    },
  });

  await prisma.customer.deleteMany({
    where: {
      workspaceId: workspace.id,
      email: {
        endsWith: "@example.com",
      },
    },
  });

  await prisma.product.deleteMany({
    where: {
      workspaceId: workspace.id,
      sku: {
        in: DEMO_PRODUCT_SKUS,
      },
    },
  });

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
