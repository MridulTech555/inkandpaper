import path from "node:path";
import { defineConfig } from "prisma/config";

try {
  process.loadEnvFile();
} catch {
  // No .env file present (e.g. in CI/production where env vars are injected directly).
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
