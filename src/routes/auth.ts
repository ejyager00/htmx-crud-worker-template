import { Hono, type Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { SignupSchema, LoginSchema } from "../schemas/auth";
import { hashPassword, verifyPassword } from "../lib/crypto";
import { signJwt, verifyJwt } from "../lib/jwt";
import { verifyTurnstile } from "../lib/turnstile";
import { render } from "../lib/render";
import { generateCsrfToken } from "../lib/csrf";
import { csrfMiddleware } from "../middleware/csrf";
import type { Env } from "../types";

type AuthContext = Context<{ Bindings: Env }>;

const ACCESS_TOKEN_TTL = 15 * 60; // 15 minutes
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days

const auth = new Hono<{ Bindings: Env }>();

/** Cookie options shared across auth cookies */
const cookieOpts = {
  httpOnly: true,
  secure: true,
  sameSite: "Lax" as const,
  path: "/",
};

/**
 * Read the CSRF token from the cookie, or generate a new one and set it.
 * The cookie is NOT httpOnly so that JS/HTMX can read it for AJAX requests.
 */
function ensureCsrfCookie(c: AuthContext): string {
  let token = getCookie(c, "csrf_token");
  if (!token) {
    token = generateCsrfToken();
    setCookie(c, "csrf_token", token, {
      sameSite: "Strict",
      secure: true,
      path: "/",
      // NOT httpOnly: JS/HTMX can read this to include it in AJAX requests
    });
  }
  return token;
}

// ---------------------------------------------------------------------------
// GET /auth/signup
// ---------------------------------------------------------------------------
auth.get("/signup", (c) => {
  const csrfToken = ensureCsrfCookie(c as AuthContext);
  return c.html(
    render("pages/signup.njk", {
      title: "Sign Up",
      turnstileSiteKey: c.env.TURNSTILE_SITE_KEY,
      csrfToken,
    })
  );
});

// ---------------------------------------------------------------------------
// POST /auth/signup
// ---------------------------------------------------------------------------
auth.post(
  "/signup",
  csrfMiddleware,
  zValidator("form", SignupSchema, (result, c) => {
    if (!result.success) {
      const ctx = c as AuthContext;
      const csrfToken = getCookie(ctx, "csrf_token") ?? "";
      return ctx.html(
        render("pages/signup.njk", {
          title: "Sign Up",
          turnstileSiteKey: ctx.env.TURNSTILE_SITE_KEY,
          error: "Invalid input. Please check your details.",
          csrfToken,
        }),
        400
      );
    }
  }),
  async (c) => {
    const { username, password, turnstileToken } = c.req.valid("form");
    const csrfToken = getCookie(c, "csrf_token") ?? "";

    // Verify Turnstile
    const turnstileOk = await verifyTurnstile(
      turnstileToken,
      c.env.TURNSTILE_SECRET_KEY
    );
    if (!turnstileOk) {
      return c.html(
        render("pages/signup.njk", {
          title: "Sign Up",
          turnstileSiteKey: c.env.TURNSTILE_SITE_KEY,
          error: "Bot check failed. Please try again.",
          csrfToken,
        }),
        400
      );
    }

    // Check username availability
    const existing = await c.env.DB.prepare(
      "SELECT id FROM users WHERE username = ?"
    )
      .bind(username)
      .first();

    if (existing) {
      return c.html(
        render("pages/signup.njk", {
          title: "Sign Up",
          turnstileSiteKey: c.env.TURNSTILE_SITE_KEY,
          error: "Username is already taken.",
          csrfToken,
        }),
        409
      );
    }

    // Create user
    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    await c.env.DB.prepare(
      "INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)"
    )
      .bind(id, username, passwordHash, Math.floor(Date.now() / 1000))
      .run();

    await issueTokens(c, id);
    return c.redirect("/", 302);
  }
);

// ---------------------------------------------------------------------------
// GET /auth/login
// ---------------------------------------------------------------------------
auth.get("/login", (c) => {
  const csrfToken = ensureCsrfCookie(c as AuthContext);
  return c.html(
    render("pages/login.njk", {
      title: "Log In",
      turnstileSiteKey: c.env.TURNSTILE_SITE_KEY,
      csrfToken,
    })
  );
});

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------
auth.post(
  "/login",
  csrfMiddleware,
  zValidator("form", LoginSchema, (result, c) => {
    if (!result.success) {
      const ctx = c as AuthContext;
      const csrfToken = getCookie(ctx, "csrf_token") ?? "";
      return ctx.html(
        render("pages/login.njk", {
          title: "Log In",
          turnstileSiteKey: ctx.env.TURNSTILE_SITE_KEY,
          error: "Invalid input.",
          csrfToken,
        }),
        400
      );
    }
  }),
  async (c) => {
    const { username, password, turnstileToken } = c.req.valid("form");
    const csrfToken = getCookie(c, "csrf_token") ?? "";

    // Verify Turnstile
    const turnstileOk = await verifyTurnstile(
      turnstileToken,
      c.env.TURNSTILE_SECRET_KEY
    );
    if (!turnstileOk) {
      return c.html(
        render("pages/login.njk", {
          title: "Log In",
          turnstileSiteKey: c.env.TURNSTILE_SITE_KEY,
          error: "Bot check failed. Please try again.",
          csrfToken,
        }),
        400
      );
    }

    // Fetch user
    const user = await c.env.DB.prepare(
      "SELECT id, password_hash FROM users WHERE username = ?"
    )
      .bind(username)
      .first<{ id: string; password_hash: string }>();

    if (!user) {
      return c.html(
        render("pages/login.njk", {
          title: "Log In",
          turnstileSiteKey: c.env.TURNSTILE_SITE_KEY,
          error: "Invalid username or password.",
          csrfToken,
        }),
        401
      );
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return c.html(
        render("pages/login.njk", {
          title: "Log In",
          turnstileSiteKey: c.env.TURNSTILE_SITE_KEY,
          error: "Invalid username or password.",
          csrfToken,
        }),
        401
      );
    }

    await issueTokens(c, user.id);
    return c.redirect("/", 302);
  }
);

// ---------------------------------------------------------------------------
// POST /auth/logout
// ---------------------------------------------------------------------------
auth.post("/logout", csrfMiddleware, async (c) => {
  const accessToken = getCookie(c, "access_token");
  const refreshToken = getCookie(c, "refresh_token");

  // Denylist access token for its remaining lifetime
  if (accessToken) {
    const payload = await verifyJwt(accessToken, c.env.JWT_SECRET);
    if (payload && typeof payload.exp === "number") {
      const ttl = payload.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await c.env.SESSIONS.put(`denylist:${accessToken}`, "1", {
          expirationTtl: ttl,
        });
      }
    }
  }

  // Delete refresh token from KV
  if (refreshToken) {
    await c.env.SESSIONS.delete(`refresh:${refreshToken}`);
  }

  deleteCookie(c, "access_token", { path: "/" });
  deleteCookie(c, "refresh_token", { path: "/" });

  return c.redirect("/auth/login", 302);
});

// ---------------------------------------------------------------------------
// POST /auth/refresh
// ---------------------------------------------------------------------------
auth.post("/refresh", async (c) => {
  const refreshToken = getCookie(c, "refresh_token");

  if (!refreshToken) return c.redirect("/auth/login", 302);

  const userId = await c.env.SESSIONS.get(`refresh:${refreshToken}`);
  if (!userId) return c.redirect("/auth/login", 302);

  // Issue new access token
  const accessToken = await signJwt(
    { sub: userId },
    c.env.JWT_SECRET,
    ACCESS_TOKEN_TTL
  );

  setCookie(c, "access_token", accessToken, {
    ...cookieOpts,
    maxAge: ACCESS_TOKEN_TTL,
  });

  return c.json({ ok: true }, 200);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function issueTokens(c: AuthContext, userId: string): Promise<void> {
  const [accessToken, refreshToken] = await Promise.all([
    signJwt({ sub: userId }, c.env.JWT_SECRET, ACCESS_TOKEN_TTL),
    generateRefreshToken(),
  ]);

  // Persist refresh token in KV
  await c.env.SESSIONS.put(`refresh:${refreshToken}`, userId, {
    expirationTtl: REFRESH_TOKEN_TTL,
  });

  setCookie(c, "access_token", accessToken, {
    ...cookieOpts,
    maxAge: ACCESS_TOKEN_TTL,
  });
  setCookie(c, "refresh_token", refreshToken, {
    ...cookieOpts,
    maxAge: REFRESH_TOKEN_TTL,
  });
}

async function generateRefreshToken(): Promise<string> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export default auth;
