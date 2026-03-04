/**
 * Precompiles Nunjucks templates to JavaScript functions.
 *
 * Cloudflare Workers disallow runtime code generation (new Function / eval),
 * which Nunjucks uses internally when compiling template strings. This script
 * compiles all .njk files at build time so the Worker only runs pre-built
 * JS functions — no code generation at runtime.
 *
 * Output: src/lib/templates-precompiled.ts
 * Usage:  node scripts/precompile-templates.js
 */

const nunjucks = require("nunjucks");
const fs = require("fs");
const path = require("path");

const TEMPLATE_DIR = path.resolve(__dirname, "..", "src", "templates");
const OUTPUT_FILE = path.resolve(
  __dirname,
  "..",
  "src",
  "lib",
  "templates-precompiled.ts"
);

const compiled = nunjucks.precompile(TEMPLATE_DIR, {
  include: [/\.njk$/],
  wrapper(templates) {
    const parts = templates.map(
      ({ name, template }) =>
        `  ${JSON.stringify(name)}: (function() {\n${template}\n  })()`
    );
    return [
      "// AUTO-GENERATED — do not edit manually.",
      "// Run `npm run precompile` to regenerate from src/templates/.",
      "// @ts-nocheck",
      "/* eslint-disable */",
      "",
      "export const precompiledTemplates: Record<string, { root: unknown }> = {",
      parts.join(",\n"),
      "};",
      "",
    ].join("\n");
  },
});

fs.writeFileSync(OUTPUT_FILE, compiled);
console.log("Precompiled templates written to", OUTPUT_FILE);
