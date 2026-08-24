import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: "postgresql://postgres:00000000@localhost:5432/nova_db",
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "nguncung65@gmail.com";
  const password = "00000000";

  const user = await prisma.user.findUnique({
    where: { email },
  });

  console.log("User found:", !!user);
  console.log("Has passwordHash:", !!user?.passwordHash);

  if (user?.passwordHash) {
    const valid = await bcrypt.compare(password, user.passwordHash);
    console.log("Password valid:", valid);
  }
}

main().finally(async () => { await prisma.$disconnect(); await pool.end(); });
