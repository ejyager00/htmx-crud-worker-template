/**
 * Nunjucks SSR helper for the Cloudflare Workers runtime.
 *
 * Cloudflare Workers disallow runtime code generation (new Function / eval),
 * which Nunjucks uses internally when compiling template strings. Templates
 * are precompiled at build time (via `npm run precompile`) into plain JS
 * functions. This loader returns those precompiled functions directly —
 * no code generation at runtime.
 *
 * To add a new template: add the .njk file under src/templates/, then run
 * `npm run precompile` to regenerate templates-precompiled.ts.
 */

import nunjucks from "nunjucks";
import { precompiledTemplates } from "./templates-precompiled";

/**
 * Custom loader that returns precompiled Nunjucks template objects.
 * Nunjucks detects `{ type: 'code', obj }` in the LoaderSource and uses
 * the compiled function directly, skipping any new Function() calls.
 */
class PrecompiledStaticLoader implements nunjucks.ILoader {
  getSource(name: string): nunjucks.LoaderSource {
    const compiled = precompiledTemplates[name];
    if (!compiled) {
      throw new Error(`Precompiled template not found: "${name}". Run \`npm run precompile\`.`);
    }
    return {
      src: { type: "code", obj: compiled } as unknown as string,
      path: name,
      noCache: false,
    };
  }
}

const env = new nunjucks.Environment(new PrecompiledStaticLoader(), {
  autoescape: true,
});

/**
 * Render a named template with the given context.
 * The name must match a key in precompiledTemplates (e.g. "pages/login.njk").
 */
export function render(
  templateName: string,
  context: Record<string, unknown> = {}
): string {
  return env.render(templateName, context);
}
