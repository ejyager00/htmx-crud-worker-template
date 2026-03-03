import { Hono } from "hono";
import { errorHandler } from "./middleware/error";
import authRoutes from "./routes/auth";
import indexRoutes from "./routes/index";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

// Global error handler
app.onError(errorHandler);

// Route groups
app.route("/auth", authRoutes);
app.route("/", indexRoutes);

// Fall through to static assets for any unmatched routes
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
