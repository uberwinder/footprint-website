import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Map NodeNext-style ".js" relative imports back to their ".ts" sources.
    alias: [{ find: /^(\.{1,2}\/.*)\.js$/, replacement: "$1" }],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
