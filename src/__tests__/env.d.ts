import type { Env } from "../types";

// Extends the vitest-pool-workers ProvidedEnv so that `env` from
// `cloudflare:test` is correctly typed with our Worker's bindings.
declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {}
}
