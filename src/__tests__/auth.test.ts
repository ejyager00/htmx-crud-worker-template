/**
 * Integration tests for auth routes.
 * Runs inside the actual workerd runtime via @cloudflare/vitest-pool-workers.
 *
 * Uses SELF.fetch() to hit the Worker directly and env.DB to manage test data.
 */

import { SELF, env } from "cloudflare:test";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createTestUser,
  loginAs,
  getAuthCookies,
  formBody,
  formBodyWithCsrf,
  type TestUser,
} from "./helpers";

// ---------------------------------------------------------------------------
// Local helpers
// ---------------------------------------------------------------------------

async function deleteTestUser(username: string) {
  await env.DB.prepare("DELETE FROM users WHERE username = ?")
    .bind(username)
    .run();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /auth/signup", () => {
  it("renders the signup page", async () => {
    const res = await SELF.fetch("http://localhost/auth/signup");
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Sign up");
    expect(text).toContain("cf-turnstile");
    expect(text).toContain('name="_csrf"');
    // Response should set the csrf_token cookie
    const setCookie = res.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toContain("csrf_token");
  });
});

describe("GET /auth/login", () => {
  it("renders the login page", async () => {
    const res = await SELF.fetch("http://localhost/auth/login");
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Log in");
    expect(text).toContain("cf-turnstile");
    expect(text).toContain('name="_csrf"');
  });
});

describe("POST /auth/signup", () => {
  const username = `testuser_${Date.now()}`;

  afterEach(async () => {
    await deleteTestUser(username);
  });

  it("rejects invalid form data with 400", async () => {
    const { body, csrfCookie } = formBodyWithCsrf({
      username: "ab",
      password: "short",
      turnstileToken: "x",
    });
    const res = await SELF.fetch("http://localhost/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: csrfCookie,
      },
      body,
    });
    expect(res.status).toBe(400);
  });

  it("returns 403 when CSRF token is missing", async () => {
    const res = await SELF.fetch("http://localhost/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody({
        username,
        password: "password123",
        turnstileToken: "test-token",
      }),
    });
    expect(res.status).toBe(403);
  });

  it("signs up a new user and redirects to /", async () => {
    const { body, csrfCookie } = formBodyWithCsrf({
      username,
      password: "password123",
      turnstileToken: "test-token",
    });
    const res = await SELF.fetch("http://localhost/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: csrfCookie,
      },
      body,
      redirect: "manual",
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/");

    const cookies = getAuthCookies(res);
    expect(cookies).toContain("access_token");
    expect(cookies).toContain("refresh_token");
  });

  it("rejects duplicate username with 409", async () => {
    await createTestUser({ username });

    const { body, csrfCookie } = formBodyWithCsrf({
      username,
      password: "password123",
      turnstileToken: "test-token",
    });
    const res = await SELF.fetch("http://localhost/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: csrfCookie,
      },
      body,
    });
    expect(res.status).toBe(409);
    expect(await res.text()).toContain("already taken");
  });
});

describe("POST /auth/login", () => {
  let user: TestUser;

  beforeEach(async () => {
    user = await createTestUser();
  });

  afterEach(async () => {
    await deleteTestUser(user.username);
  });

  it("logs in with correct credentials and redirects to /", async () => {
    const { body, csrfCookie } = formBodyWithCsrf({
      username: user.username,
      password: user.password,
      turnstileToken: "test-token",
    });
    const res = await SELF.fetch("http://localhost/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: csrfCookie,
      },
      body,
      redirect: "manual",
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/");
  });

  it("rejects wrong password with 401", async () => {
    const { body, csrfCookie } = formBodyWithCsrf({
      username: user.username,
      password: "wrongpassword",
      turnstileToken: "test-token",
    });
    const res = await SELF.fetch("http://localhost/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: csrfCookie,
      },
      body,
    });
    expect(res.status).toBe(401);
    expect(await res.text()).toContain("Invalid username or password");
  });
});

describe("POST /auth/logout", () => {
  it("clears cookies and redirects to /auth/login", async () => {
    // Logout requires a valid CSRF token
    const { body, csrfCookie } = formBodyWithCsrf({});
    const res = await SELF.fetch("http://localhost/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: csrfCookie,
      },
      body,
      redirect: "manual",
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/auth/login");
  });
});

describe("loginAs helper", () => {
  let user: TestUser;

  beforeEach(async () => {
    user = await createTestUser();
  });

  afterEach(async () => {
    await deleteTestUser(user.username);
  });

  it("returns auth cookies for a valid user", async () => {
    const cookies = await loginAs(user.username, user.password);
    expect(cookies).toContain("access_token");
    expect(cookies).toContain("refresh_token");
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
