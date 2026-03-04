import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { verifyJwt } from "../lib/jwt";
import type { Env, User } from "../types";

/**
 * JWT auth middleware.
 * Reads the `access_token` httpOnly cookie, checks the KV denylist,
 * verifies the token, and sets `userId` and `user` in the context.
 *
 * On failure:
 * - API/JSON requests → 401 JSON response
 * - Browser requests (Accept: text/html) → redirect to /auth/login
 */
export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: { userId: string; user: User };
}>(async (c, next) => {
  const token = getCookie(c, "access_token");

  const fail = () => {
    const acceptsHtml = c.req.header("Accept")?.includes("text/html");
    if (acceptsHtml) {
      return c.redirect("/auth/login", 302);
    }
    return c.json({ error: "Unauthorized", status: 401 }, 401);
  };

  if (!token) return fail();

  // Check denylist
  const denied = await c.env.SESSIONS.get(`denylist:${token}`);
  if (denied !== null) return fail();

  // Verify JWT
  const payload = await verifyJwt(token, c.env.JWT_SECRET);
  if (
    !payload ||
    typeof payload.sub !== "string" ||
    typeof payload.username !== "string"
  )
    return fail();

  c.set("userId", payload.sub);
  c.set("user", { id: payload.sub, username: payload.username });
  await next();
});
