import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  // nunjucks is a CJS-only module. The workerd runtime (used by vitest-pool-workers)
  // cannot import CJS natively, so we force Vite to pre-bundle it to ESM first.
  ssr: {
    noExternal: ["nunjucks"],
  },
  test: {
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          // Provide test-only secrets so tests work without a .dev.vars file.
          // TURNSTILE_SECRET_KEY is Cloudflare's always-pass test key.
          bindings: {
            JWT_SECRET: "test-jwt-secret-do-not-use-in-production",
            TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
            ENVIRONMENT: "dev",
          },
        },
      },
    },
  },
});
