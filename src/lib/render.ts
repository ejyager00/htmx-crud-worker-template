/**
 * Nunjucks SSR helper for the Cloudflare Workers runtime.
 *
 * Nunjucks' filesystem-based configure() does NOT work in Workers.
 * Templates are imported as raw strings via Wrangler `rules` (type: Text)
 * and registered in a static map. A custom ILoader resolves {% include %}
 * and {% extends %} directives from that map.
 */

import nunjucks from "nunjucks";

// Template imports — each .njk file is bundled as a raw string by Wrangler.
import baseTpl from "../templates/base.njk";
import headTpl from "../templates/partials/head.njk";
import navTpl from "../templates/partials/nav.njk";
import headerTpl from "../templates/partials/header.njk";
import footerTpl from "../templates/partials/footer.njk";
import signupTpl from "../templates/pages/signup.njk";
import loginTpl from "../templates/pages/login.njk";

// Map template names (as referenced in {% include %} / {% extends %}) to their source strings.
const TEMPLATE_MAP: Record<string, string> = {
  "base.njk": baseTpl,
  "partials/head.njk": headTpl,
  "partials/nav.njk": navTpl,
  "partials/header.njk": headerTpl,
  "partials/footer.njk": footerTpl,
  "pages/signup.njk": signupTpl,
  "pages/login.njk": loginTpl,
};

/**
 * Custom Nunjucks loader that resolves templates from TEMPLATE_MAP.
 * Implements the ILoader interface required by nunjucks.Environment.
 */
class StaticLoader implements nunjucks.ILoader {
  getSource(name: string): nunjucks.LoaderSource {
    const src = TEMPLATE_MAP[name];
    if (src === undefined) {
      throw new Error(`Template not found: "${name}"`);
    }
    return {
      src,
      path: name,
      noCache: false,
    };
  }
}

const env = new nunjucks.Environment(new StaticLoader(), { autoescape: true });

/**
 * Render a named template with the given context.
 * The name must match a key in TEMPLATE_MAP (e.g. "pages/login.njk").
 */
export function render(
  templateName: string,
  context: Record<string, unknown> = {}
): string {
  return env.render(templateName, context);
}
