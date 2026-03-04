/**
 * Shared test helpers for integration tests.
 * Runs inside the workerd environment via @cloudflare/vitest-pool-workers.
 */

import { SELF, env } from "cloudflare:test";
import { hashPassword } from "../lib/crypto";

export interface TestUser {
  id: string;
  username: string;
  password: string;
  passwordHash: string;
}

/**
 * Insert a test user into D1 with a real PBKDF2 password hash.
 */
export async function createTestUser(options?: {
  username?: string;
  password?: string;
}): Promise<TestUser> {
  const username =
    options?.username ?? `testuser_${crypto.randomUUID().slice(0, 8)}`;
  const password = options?.password ?? "password123";
  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();

  await env.DB.prepare(
    "INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)"
  )
    .bind(id, username, passwordHash, Math.floor(Date.now() / 1000))
    .run();

  return { id, username, password, passwordHash };
}

/**
 * Extract auth cookies from a login/signup response into a `Cookie:` header value
 * suitable for subsequent requests.
 *
 * Returns a string like "access_token=xxx; refresh_token=yyy".
 */
export function getAuthCookies(response: Response): string {
  // In the Workers runtime, Headers may expose getSetCookie() for multiple Set-Cookie values.
  const headers = response.headers as Headers & { getSetCookie?(): string[] };
  const setCookies: string[] = headers.getSetCookie
    ? headers.getSetCookie()
    : [response.headers.get("set-cookie") ?? ""];

  return setCookies
    .filter(Boolean)
    .map((c) => c.split(";")[0])
    .join("; ");
}

/**
 * Log in as the given user and return a `Cookie:` header string containing
 * the auth cookies, ready to attach to subsequent requests.
 */
export async function loginAs(
  username: string,
  password: string
): Promise<string> {
  const csrfToken = crypto.randomUUID();
  const res = await SELF.fetch("http://localhost/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: `csrf_token=${csrfToken}`,
    },
    body: new URLSearchParams({
      username,
      password,
      turnstileToken: "test-token",
      _csrf: csrfToken,
    }).toString(),
    redirect: "manual",
  });
  return getAuthCookies(res);
}

/**
 * Build a form-encoded body string from a key-value map.
 */
export function formBody(data: Record<string, string>): string {
  return new URLSearchParams(data).toString();
}

/**
 * Build a form-encoded body that includes a matching CSRF token.
 * Also returns the token and cookie string for use in request headers.
 */
export function formBodyWithCsrf(
  data: Record<string, string>
): { body: string; csrfToken: string; csrfCookie: string } {
  const csrfToken = crypto.randomUUID();
  const body = new URLSearchParams({ ...data, _csrf: csrfToken }).toString();
  return { body, csrfToken, csrfCookie: `csrf_token=${csrfToken}` };
}
