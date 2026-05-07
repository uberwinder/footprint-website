import { defineConfig } from "drizzle-kit";
import path from "path";

const url = process.env.EXTERNAL_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "Set EXTERNAL_DATABASE_URL (Render external URL) or DATABASE_URL to run migrations",
  );
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url,
    ssl: process.env.EXTERNAL_DATABASE_URL ? { rejectUnauthorized: false } : undefined,
  },
});
