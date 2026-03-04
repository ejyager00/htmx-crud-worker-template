import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { ensureCsrfCookie } from "../lib/csrf";
import { render } from "../lib/render";
import type { Env } from "../types";

const index = new Hono<{
  Bindings: Env;
  Variables: { userId: string };
}>();

/** Health check */
index.get("/health", (c) => c.json({ ok: true }));

/** Protected home page */
index.get("/", authMiddleware, (c) => {
  const csrfToken = ensureCsrfCookie(c);
  return c.html(render("pages/index.njk", { title: "Home", csrfToken, user: c.get("user") }));
});

export default index;
