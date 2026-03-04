/**
 * Global test setup — runs inside the workerd environment before each test file.
 * Applies the D1 schema so every test suite starts with the correct tables.
 */
import { env } from "cloudflare:test";
import { beforeAll } from "vitest";

beforeAll(async () => {
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at INTEGER NOT NULL)"
  ).run();
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)"
  ).run();
  await env.DB.prepare(
    "CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)"
  ).run();
});
