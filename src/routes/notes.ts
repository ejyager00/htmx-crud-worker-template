import { Hono, type Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getCookie } from "hono/cookie";
import { NoteSchema } from "../schemas/notes";
import { authMiddleware } from "../middleware/auth";
import { csrfMiddleware } from "../middleware/csrf";
import { ensureCsrfCookie } from "../lib/csrf";
import { render } from "../lib/render";
import type { Env, User } from "../types";

type NotesContext = Context<{ Bindings: Env; Variables: { userId: string; user: User } }>;

interface Note {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: number;
  updated_at: number;
}

const notes = new Hono<{
  Bindings: Env;
  Variables: { userId: string; user: User };
}>();

// All notes routes require authentication
notes.use("*", authMiddleware);

// ---------------------------------------------------------------------------
// GET /notes — list user's notes
// ---------------------------------------------------------------------------
notes.get("/", async (c) => {
  const userId = c.get("userId");
  const rows = await c.env.DB.prepare(
    "SELECT id, title, created_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC"
  )
    .bind(userId)
    .all<Pick<Note, "id" | "title" | "created_at">>();

  const csrfToken = ensureCsrfCookie(c as NotesContext);
  return c.html(
    render("pages/notes/list.njk", {
      title: "My Notes",
      notes: rows.results,
      csrfToken,
      user: c.get("user"),
    })
  );
});

// ---------------------------------------------------------------------------
// GET /notes/new — create form
// ---------------------------------------------------------------------------
notes.get("/new", (c) => {
  const csrfToken = ensureCsrfCookie(c as NotesContext);
  return c.html(
    render("pages/notes/form.njk", {
      title: "New Note",
      action: "/notes",
      csrfToken,
      user: c.get("user"),
    })
  );
});

// ---------------------------------------------------------------------------
// POST /notes — create note
// ---------------------------------------------------------------------------
notes.post(
  "/",
  csrfMiddleware,
  zValidator("form", NoteSchema, (result, c) => {
    if (!result.success) {
      const csrfToken = getCookie(c, "csrf_token") ?? "";
      return c.html(
        render("pages/notes/form.njk", {
          title: "New Note",
          action: "/notes",
          error: "Invalid input. Title is required (max 200 chars).",
          csrfToken,
        }),
        400
      );
    }
  }),
  async (c) => {
    const userId = c.get("userId");
    const { title, body } = c.req.valid("form");
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await c.env.DB.prepare(
      "INSERT INTO notes (id, user_id, title, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(id, userId, title, body, now, now)
      .run();

    return c.redirect(`/notes/${id}`, 302);
  }
);

// ---------------------------------------------------------------------------
// GET /notes/:id — view note
// ---------------------------------------------------------------------------
notes.get("/:id", async (c) => {
  const userId = c.get("userId");
  const note = await c.env.DB.prepare(
    "SELECT * FROM notes WHERE id = ? AND user_id = ?"
  )
    .bind(c.req.param("id"), userId)
    .first<Note>();

  if (!note) return c.notFound();

  const csrfToken = ensureCsrfCookie(c as NotesContext);
  return c.html(
    render("pages/notes/detail.njk", {
      title: note.title,
      note,
      csrfToken,
      user: c.get("user"),
    })
  );
});

// ---------------------------------------------------------------------------
// GET /notes/:id/edit — edit form
// ---------------------------------------------------------------------------
notes.get("/:id/edit", async (c) => {
  const userId = c.get("userId");
  const note = await c.env.DB.prepare(
    "SELECT * FROM notes WHERE id = ? AND user_id = ?"
  )
    .bind(c.req.param("id"), userId)
    .first<Note>();

  if (!note) return c.notFound();

  const csrfToken = ensureCsrfCookie(c as NotesContext);
  return c.html(
    render("pages/notes/form.njk", {
      title: `Edit: ${note.title}`,
      action: `/notes/${note.id}`,
      note,
      csrfToken,
      user: c.get("user"),
    })
  );
});

// ---------------------------------------------------------------------------
// POST /notes/:id — update note
// ---------------------------------------------------------------------------
notes.post(
  "/:id",
  csrfMiddleware,
  zValidator("form", NoteSchema, (result, c) => {
    if (!result.success) {
      const csrfToken = getCookie(c, "csrf_token") ?? "";
      return c.html(
        render("pages/notes/form.njk", {
          title: "Edit Note",
          action: `/notes/${c.req.param("id")}`,
          error: "Invalid input. Title is required (max 200 chars).",
          csrfToken,
        }),
        400
      );
    }
  }),
  async (c) => {
    const userId = c.get("userId");
    const noteId = c.req.param("id");
    const { title, body } = c.req.valid("form");

    const existing = await c.env.DB.prepare(
      "SELECT id FROM notes WHERE id = ? AND user_id = ?"
    )
      .bind(noteId, userId)
      .first();

    if (!existing) return c.notFound();

    await c.env.DB.prepare(
      "UPDATE notes SET title = ?, body = ?, updated_at = ? WHERE id = ? AND user_id = ?"
    )
      .bind(title, body, Math.floor(Date.now() / 1000), noteId, userId)
      .run();

    return c.redirect(`/notes/${noteId}`, 302);
  }
);

// ---------------------------------------------------------------------------
// POST /notes/:id/delete — delete note
// ---------------------------------------------------------------------------
notes.post("/:id/delete", csrfMiddleware, async (c) => {
  const userId = c.get("userId");
  const noteId = c.req.param("id");

  const existing = await c.env.DB.prepare(
    "SELECT id FROM notes WHERE id = ? AND user_id = ?"
  )
    .bind(noteId, userId)
    .first();

  if (!existing) return c.notFound();

  await c.env.DB.prepare("DELETE FROM notes WHERE id = ? AND user_id = ?")
    .bind(noteId, userId)
    .run();

  return c.redirect("/notes", 302);
});

export default notes;
