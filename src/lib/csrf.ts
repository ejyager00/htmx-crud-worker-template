/**
 * CSRF protection utilities — double-submit cookie pattern.
 *
 * On GET (form page):
 *   1. Call ensureCsrfCookie(c) to read or generate the token and set the cookie.
 *   2. Pass the returned token to the template as `csrfToken`.
 *   3. The template renders <input type="hidden" name="_csrf" value="{{ csrfToken }}">.
 *
 * On POST:
 *   csrfMiddleware compares the `_csrf` form field with the `csrf_token` cookie.
 *   Mismatch → 403.
 */

import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

/** Generate a new CSRF token (random UUID). */
export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

/**
 * Read the CSRF token from the cookie, or generate a new one and set it.
 * The cookie is NOT httpOnly so that JS/HTMX can read it for AJAX requests.
 * Call this in every GET handler that renders a form, and pass the result to
 * the template as `csrfToken`.
 */
export function ensureCsrfCookie(c: Context): string {
  const existing = getCookie(c, "csrf_token");
  if (existing) return existing;

  const token = generateCsrfToken();
  setCookie(c, "csrf_token", token, {
    sameSite: "Strict",
    secure: true,
    path: "/",
    // NOT httpOnly: JS/HTMX needs to read this to include it in AJAX requests.
  });
  return token;
}

/**
 * Validate the double-submit CSRF pair.
 * Both values must be present and equal.
 */
export function validateCsrfToken(
  formValue: string | undefined,
  cookieValue: string | undefined
): boolean {
  if (!formValue || !cookieValue) return false;
  return formValue === cookieValue;
}
