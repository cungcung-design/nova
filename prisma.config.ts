import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    url: "postgresql://postgres:00000000@localhost:5432/nova_db",
  },

  migrations: {
    seed: "npx tsx ./prisma/seed.ts",
  },
});
