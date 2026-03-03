import { type Context } from "hono";
import type { Env } from "../types";

/**
 * Global Hono error handler.
 * - HTML requests get a minimal inline error page.
 * - JSON/API requests get { error, status }.
 * - Stack traces are hidden in production.
 */
export function errorHandler(err: Error, c: Context<{ Bindings: Env }>) {
  console.error("[error]", err.message, err.stack);

  const status = (err as { status?: number }).status ?? 500;
  const isDev = c.env.ENVIRONMENT === "dev";
  const message = err.message || "Internal Server Error";
  const detail = isDev ? err.stack ?? message : message;

  const acceptsHtml = c.req.header("Accept")?.includes("text/html");

  if (acceptsHtml) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Error ${status}</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:4rem auto;padding:0 1rem">
  <h1>Error ${status}</h1>
  <p>${escapeHtml(message)}</p>
  ${isDev ? `<pre style="background:#f4f4f4;padding:1rem;overflow:auto">${escapeHtml(detail)}</pre>` : ""}
  <a href="/">← Home</a>
</body>
</html>`;
    return c.html(html, status as Parameters<typeof c.html>[1]);
  }

  return c.json({ error: message, status }, status as Parameters<typeof c.json>[1]);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
