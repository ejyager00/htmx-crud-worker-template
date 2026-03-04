/**
 * CSRF middleware — double-submit cookie pattern.
 *
 * Skips GET/HEAD/OPTIONS. On mutating methods (POST, PUT, DELETE, PATCH):
 *   - Reads the `csrf_token` cookie
 *   - Reads the `_csrf` field from the request form body (via a cloned request
 *     so the original body stream remains available for downstream handlers)
 *   - Returns 403 if the values are missing or don't match
 */

import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { validateCsrfToken } from "../lib/csrf";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const csrfMiddleware = createMiddleware(async (c, next) => {
  if (SAFE_METHODS.has(c.req.method.toUpperCase())) {
    await next();
    return;
  }

  const cookieValue = getCookie(c, "csrf_token");

  // Clone the raw request so reading form data here doesn't consume the body
  // for downstream handlers (e.g. zValidator).
  let formValue: string | undefined;
  try {
    const cloned = c.req.raw.clone();
    const fd = await cloned.formData();
    formValue = fd.get("_csrf")?.toString();
  } catch {
    // Non-form bodies (JSON, etc.) won't have _csrf — treat as missing.
  }

  if (!validateCsrfToken(formValue, cookieValue)) {
    return c.text("CSRF token mismatch", 403);
  }

  await next();
});
