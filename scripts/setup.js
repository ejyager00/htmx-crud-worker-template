#!/usr/bin/env node
/**
 * Setup wizard for htmx-crud-worker-template.
 *
 * Automates D1 and KV provisioning via wrangler CLI, then patches
 * wrangler.jsonc with real resource IDs and updates the project name.
 *
 * Usage: node scripts/setup.js
 */

const readline = require("node:readline");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const WRANGLER_CONFIG = path.resolve(__dirname, "..", "wrangler.jsonc");

// Placeholder IDs used in the template — will be replaced
const PLACEHOLDER_D1_PROD_ROOT = "00000000-0000-0000-0000-000000000000";
const PLACEHOLDER_D1_DEV = "00000000-0000-0000-0000-000000000001";
const PLACEHOLDER_D1_PROD = "00000000-0000-0000-0000-000000000002";
const PLACEHOLDER_KV_ROOT = "00000000000000000000000000000000";
const PLACEHOLDER_KV_DEV = "00000000000000000000000000000001";
const PLACEHOLDER_KV_PROD = "00000000000000000000000000000002";

// ---------------------------------------------------------------------------
// Prompt helper
// ---------------------------------------------------------------------------

function prompt(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

// ---------------------------------------------------------------------------
// Wrangler helpers
// ---------------------------------------------------------------------------

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" });
}

/**
 * Create a D1 database. Returns the database_id.
 * Falls back to listing existing databases if creation fails (already exists).
 */
function ensureD1(name) {
  console.log(`  Creating D1 database: ${name} ...`);
  try {
    const out = run(`wrangler d1 create "${name}" 2>&1`);
    const match = out.match(/database_id\s*=\s*"?([0-9a-f-]{36})"?/i);
    if (match) return match[1];
  } catch (err) {
    console.log(`  (Creation failed — checking existing databases...)`);
  }
  // Fall back: list databases and find by name
  try {
    const out = run(`wrangler d1 list --json 2>/dev/null`);
    const dbs = JSON.parse(out);
    const found = dbs.find((db) => db.name === name);
    if (found) return found.uuid || found.database_id;
  } catch {}
  throw new Error(`Could not create or find D1 database: ${name}`);
}

/**
 * Create a KV namespace. Returns the namespace id.
 * Falls back to listing existing namespaces if creation fails.
 */
function ensureKV(title) {
  console.log(`  Creating KV namespace: ${title} ...`);
  try {
    const out = run(`wrangler kv namespace create "${title}" 2>&1`);
    const match = out.match(/id\s*=\s*"([0-9a-f]{32})"/i);
    if (match) return match[1];
  } catch (err) {
    console.log(`  (Creation failed — checking existing namespaces...)`);
  }
  // Fall back: list namespaces and find by title
  try {
    const out = run(`wrangler kv namespace list 2>/dev/null`);
    const namespaces = JSON.parse(out);
    const found = namespaces.find((ns) => ns.title === title);
    if (found) return found.id;
  } catch {}
  throw new Error(`Could not create or find KV namespace: ${title}`);
}

// ---------------------------------------------------------------------------
// wrangler.jsonc patching
// ---------------------------------------------------------------------------

function patchWranglerConfig(projectName, ids) {
  let content = fs.readFileSync(WRANGLER_CONFIG, "utf8");

  // Rename app (my-app → projectName)
  content = content.replace(/"my-app-dev"/g, `"${projectName}-dev"`);
  content = content.replace(/"my-app-db-dev"/g, `"${projectName}-db-dev"`);
  content = content.replace(/"my-app-db"/g, `"${projectName}-db"`);
  content = content.replace(/"my-app"/g, `"${projectName}"`);

  // Patch placeholder D1 IDs
  content = content.replace(
    new RegExp(`"${PLACEHOLDER_D1_PROD_ROOT}"`, "g"),
    `"${ids.d1ProdRoot}"`
  );
  content = content.replace(
    new RegExp(`"${PLACEHOLDER_D1_DEV}"`, "g"),
    `"${ids.d1Dev}"`
  );
  content = content.replace(
    new RegExp(`"${PLACEHOLDER_D1_PROD}"`, "g"),
    `"${ids.d1Prod}"`
  );

  // Patch placeholder KV IDs
  content = content.replace(
    new RegExp(`"${PLACEHOLDER_KV_ROOT}"`, "g"),
    `"${ids.kvRoot}"`
  );
  content = content.replace(
    new RegExp(`"${PLACEHOLDER_KV_DEV}"`, "g"),
    `"${ids.kvDev}"`
  );
  content = content.replace(
    new RegExp(`"${PLACEHOLDER_KV_PROD}"`, "g"),
    `"${ids.kvProd}"`
  );

  // Remove // TODO comments on ID lines
  content = content.replace(/ \/\/ TODO: replace with real ID/g, "");

  fs.writeFileSync(WRANGLER_CONFIG, content);
  console.log(`  Patched wrangler.jsonc`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n=== Cloudflare Worker CRUD Template Setup ===\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const defaultName = path.basename(process.cwd());
  const inputName = await prompt(
    rl,
    `Project name [${defaultName}]: `
  );
  const projectName = inputName.trim() || defaultName;

  rl.close();

  console.log(`\nSetting up project: "${projectName}"\n`);

  let ids;
  try {
    // Top-level / production resources (shared root binding + production env)
    const d1ProdRoot = ensureD1(`${projectName}-db`);
    const kvRoot = ensureKV(`${projectName}-sessions`);

    // Dev environment resources
    const d1Dev = ensureD1(`${projectName}-db-dev`);
    const kvDev = ensureKV(`${projectName}-sessions-dev`);

    // Production uses the same DB/KV as root
    ids = {
      d1ProdRoot,
      d1Dev,
      d1Prod: d1ProdRoot,
      kvRoot,
      kvDev,
      kvProd: kvRoot,
    };
  } catch (err) {
    console.error(`\nError: ${err.message}`);
    console.error(
      "Make sure wrangler is authenticated (`wrangler login`) and try again."
    );
    process.exit(1);
  }

  console.log("\nProvisioned resources:");
  console.log(`  D1 (prod):  ${ids.d1ProdRoot}`);
  console.log(`  D1 (dev):   ${ids.d1Dev}`);
  console.log(`  KV (prod):  ${ids.kvRoot}`);
  console.log(`  KV (dev):   ${ids.kvDev}`);

  console.log("\nPatching wrangler.jsonc ...");
  patchWranglerConfig(projectName, ids);

  console.log("\nRegenerating TypeScript types ...");
  try {
    run("npm run types");
    console.log("  Done.");
  } catch (err) {
    console.warn("  Warning: `npm run types` failed. Run it manually.");
  }

  console.log(`
Setup complete! Next steps:
  1. Copy .dev.vars.example to .dev.vars and fill in JWT_SECRET and TURNSTILE_SECRET_KEY
  2. Run:  npm run db:migrate:dev
  3. Run:  npm run dev
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
