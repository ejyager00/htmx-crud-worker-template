/**
 * Integration tests for auth routes.
 * Runs inside the actual workerd runtime via @cloudflare/vitest-pool-workers.
 *
 * Uses SELF.fetch() to hit the Worker directly and env.DB to manage test data.
 */

import { SELF, env } from "cloudflare:test";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Insert a test user directly into D1. */
async function createTestUser(
  username: string,
  passwordHash: string = "pbkdf2:sha256:300000:dGVzdA==:dGVzdA=="
) {
  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)"
  )
    .bind(id, username, passwordHash, Math.floor(Date.now() / 1000))
    .run();
  return id;
}

/** Delete test user by username. */
async function deleteTestUser(username: string) {
  await env.DB.prepare("DELETE FROM users WHERE username = ?")
    .bind(username)
    .run();
}

/** Build a form-encoded body. */
function formBody(data: Record<string, string>): string {
  return new URLSearchParams(data).toString();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /auth/signup", () => {
  it("renders the signup page", async () => {
    const res = await SELF.fetch("http://localhost/auth/signup");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("Sign up");
    expect(body).toContain("cf-turnstile");
  });
});

describe("GET /auth/login", () => {
  it("renders the login page", async () => {
    const res = await SELF.fetch("http://localhost/auth/login");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("Log in");
    expect(body).toContain("cf-turnstile");
  });
});

describe("POST /auth/signup", () => {
  const username = `testuser_${Date.now()}`;

  afterEach(async () => {
    await deleteTestUser(username);
  });

  it("rejects invalid form data", async () => {
    const res = await SELF.fetch("http://localhost/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody({ username: "ab", password: "short", turnstileToken: "x" }),
    });
    // Validation failure → 400
    expect(res.status).toBe(400);
  });

  it("signs up a new user and redirects to /", async () => {
    const res = await SELF.fetch("http://localhost/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      // Turnstile always-pass test secret: 1x0000000000000000000000000000000AA
      // With the test secret, any token passes.
      body: formBody({
        username,
        password: "password123",
        turnstileToken: "test-token",
      }),
      redirect: "manual",
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/");

    // Access and refresh tokens should be set
    const setCookie = res.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toContain("access_token");
    expect(setCookie).toContain("refresh_token");
  });

  it("rejects duplicate username", async () => {
    // Pre-create user
    await createTestUser(username);

    const res = await SELF.fetch("http://localhost/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody({
        username,
        password: "password123",
        turnstileToken: "test-token",
      }),
    });
    expect(res.status).toBe(409);
    const body = await res.text();
    expect(body).toContain("already taken");
  });
});

describe("POST /auth/login", () => {
  const username = `logintest_${Date.now()}`;

  beforeEach(async () => {
    // Sign up the user so we have a real password hash
    await SELF.fetch("http://localhost/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody({
        username,
        password: "password123",
        turnstileToken: "test-token",
      }),
      redirect: "manual",
    });
  });

  afterEach(async () => {
    await deleteTestUser(username);
  });

  it("logs in with correct credentials and redirects to /", async () => {
    const res = await SELF.fetch("http://localhost/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody({
        username,
        password: "password123",
        turnstileToken: "test-token",
      }),
      redirect: "manual",
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/");
  });

  it("rejects wrong password with 401", async () => {
    const res = await SELF.fetch("http://localhost/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody({
        username,
        password: "wrongpassword",
        turnstileToken: "test-token",
      }),
    });
    expect(res.status).toBe(401);
    const body = await res.text();
    expect(body).toContain("Invalid username or password");
  });
});

describe("POST /auth/logout", () => {
  it("clears cookies and redirects to /auth/login", async () => {
    const res = await SELF.fetch("http://localhost/auth/logout", {
      method: "POST",
      redirect: "manual",
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/auth/login");
  });
});

describe("GET /health", () => {
  it("returns 200 ok", async () => {
    const res = await SELF.fetch("http://localhost/health");
    expect(res.status).toBe(200);
    const body = await res.json<{ ok: boolean }>();
    expect(body.ok).toBe(true);
  });
});
