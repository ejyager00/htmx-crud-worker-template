/**
 * JWT signing and verification using SubtleCrypto (HMAC-SHA256 / HS256).
 * No jsonwebtoken or similar — works in the Cloudflare Workers runtime.
 */

const ALG = { name: "HMAC", hash: "SHA-256" };

/**
 * Sign a JWT with HS256.
 */
export async function signJwt(
  payload: Record<string, unknown>,
  secret: string,
  expiresInSeconds: number
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(fullPayload));
  const signingInput = `${header}.${body}`;

  const key = await importKey(secret);
  const signature = await crypto.subtle.sign(
    ALG,
    key,
    new TextEncoder().encode(signingInput)
  );

  return `${signingInput}.${arrayToB64url(new Uint8Array(signature))}`;
}

/**
 * Verify and decode a JWT. Returns null if invalid or expired.
 */
export async function verifyJwt(
  token: string,
  secret: string
): Promise<Record<string, unknown> | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, body, sig] = parts;
  const signingInput = `${header}.${body}`;

  const key = await importKey(secret);
  const signatureBytes = b64urlToArray(sig);

  const valid = await crypto.subtle.verify(
    ALG,
    key,
    signatureBytes,
    new TextEncoder().encode(signingInput)
  );

  if (!valid) return null;

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(atob(base64urlToBase64(body)));
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && payload.exp < now) return null;

  return payload;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    ALG,
    false,
    ["sign", "verify"]
  );
}

function b64url(str: string): string {
  return arrayToB64url(new TextEncoder().encode(str));
}

function arrayToB64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function b64urlToArray(str: string): Uint8Array {
  return Uint8Array.from(atob(base64urlToBase64(str)), (c) => c.charCodeAt(0));
}

function base64urlToBase64(str: string): string {
  return str.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    str.length + ((4 - (str.length % 4)) % 4),
    "="
  );
}
