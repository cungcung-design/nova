import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: "postgresql://postgres:00000000@localhost:5432/nova_db",
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "nguncung65@gmail.com" },
    include: { memberships: { include: { workspace: true } } },
  });

  console.log("User:", user ? { id: user.id, email: user.email, name: user.name, hasPassword: !!user.passwordHash } : "NOT FOUND");
  console.log("Memberships:", user?.memberships.map(m => ({ role: m.role, workspace: m.workspace.name })) ?? "NONE");
}

main().finally(async () => { await prisma.$disconnect(); await pool.end(); });
