import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      all: true,
      include: ["app.js", "src/**/*.js"],
      exclude: ["src/index.js"],
      lines: 100,
      statements: 100,
      functions: 100,
      branches: 100,
    },
  },
});
