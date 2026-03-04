import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { ensureCsrfCookie } from "../lib/csrf";
import type { Env } from "../types";

const index = new Hono<{
  Bindings: Env;
  Variables: { userId: string };
}>();

/** Health check */
index.get("/health", (c) => c.json({ ok: true }));

/** Protected home page */
index.get("/", authMiddleware, (c) => {
  const userId = c.get("userId");
  const csrfToken = ensureCsrfCookie(c);
  return c.html(
    `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>App</title></head>
<body>
  <h1>Welcome</h1>
  <p>Logged in as user <code>${userId}</code></p>
  <form method="POST" action="/auth/logout">
    <input type="hidden" name="_csrf" value="${csrfToken}">
    <button type="submit">Log out</button>
  </form>
</body>
</html>`
  );
});

export default index;
