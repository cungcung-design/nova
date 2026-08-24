import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "00000000",
  database: "nova_db",
});

async function main() {
  const result = await pool.query(
    `ALTER TABLE "OrderItem" RENAME COLUMN "unitPrice" TO "price";`,
  );
  console.log("Renamed column:", result.command);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
