/**
 * CSRF protection utilities — double-submit cookie pattern.
 *
 * On GET (form page):
 *   1. Read `csrf_token` cookie; if absent, generate one and set it.
 *   2. Pass the token to the template as `csrfToken`.
 *   3. The template renders <input type="hidden" name="_csrf" value="{{ csrfToken }}">.
 *
 * On POST:
 *   csrfMiddleware compares the `_csrf` form field with the `csrf_token` cookie.
 *   Mismatch → 403.
 */

/** Generate a new CSRF token (random UUID). */
export function generateCsrfToken(): string {
  return crypto.randomUUID();
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
