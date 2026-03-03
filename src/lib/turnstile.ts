/**
 * Cloudflare Turnstile server-side token verification.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Turnstile challenge token. Returns true if valid.
 */
export async function verifyTurnstile(
  token: string,
  secretKey: string
): Promise<boolean> {
  const body = new FormData();
  body.append("secret", secretKey);
  body.append("response", token);

  const res = await fetch(VERIFY_URL, { method: "POST", body });
  if (!res.ok) return false;

  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}
