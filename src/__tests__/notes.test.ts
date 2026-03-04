/**
 * Integration tests for notes CRUD routes.
 * Runs inside the actual workerd runtime via @cloudflare/vitest-pool-workers.
 */

import { SELF, env } from "cloudflare:test";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createTestUser,
  loginAs,
  formBodyWithCsrf,
  type TestUser,
} from "./helpers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function deleteTestUser(id: string) {
  // ON DELETE CASCADE removes the user's notes too
  await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /notes (unauthenticated)", () => {
  it("redirects to /auth/login", async () => {
    const res = await SELF.fetch("http://localhost/notes", {
      redirect: "manual",
      headers: { Accept: "text/html" },
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/auth/login");
  });
});

describe("Notes CRUD (authenticated)", () => {
  let user: TestUser;
  let cookies: string;

  beforeEach(async () => {
    user = await createTestUser();
    cookies = await loginAs(user.username, user.password);
  });

  afterEach(async () => {
    await deleteTestUser(user.id);
  });

  // -------------------------------------------------------------------------
  // List
  // -------------------------------------------------------------------------

  it("GET /notes returns 200 with empty list", async () => {
    const res = await SELF.fetch("http://localhost/notes", {
      headers: { Cookie: cookies },
    });
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("My Notes");
    expect(body).toContain("Create your first note");
  });

  // -------------------------------------------------------------------------
  // Create
  // -------------------------------------------------------------------------

  it("GET /notes/new returns 200 with form", async () => {
    const res = await SELF.fetch("http://localhost/notes/new", {
      headers: { Cookie: cookies },
    });
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("New Note");
    expect(body).toContain('name="_csrf"');
  });

  it("POST /notes creates a note and redirects to it", async () => {
    const { body, csrfCookie } = formBodyWithCsrf({
      title: "Test Note",
      body: "Hello world",
    });

    const res = await SELF.fetch("http://localhost/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: `${cookies}; ${csrfCookie}`,
      },
      body,
      redirect: "manual",
    });

    expect(res.status).toBe(302);
    const location = res.headers.get("Location") ?? "";
    expect(location).toMatch(/^\/notes\/[0-9a-f-]{36}$/);

    // Verify in DB
    const row = await env.DB.prepare(
      "SELECT * FROM notes WHERE user_id = ?"
    ).bind(user.id).first<{ title: string; body: string }>();
    expect(row?.title).toBe("Test Note");
    expect(row?.body).toBe("Hello world");
  });

  it("POST /notes rejects empty title with 400", async () => {
    const { body, csrfCookie } = formBodyWithCsrf({ title: "", body: "content" });

    const res = await SELF.fetch("http://localhost/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: `${cookies}; ${csrfCookie}`,
      },
      body,
    });
    expect(res.status).toBe(400);
  });

  it("POST /notes returns 403 without CSRF token", async () => {
    const res = await SELF.fetch("http://localhost/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookies,
      },
      body: new URLSearchParams({ title: "Test", body: "" }).toString(),
    });
    expect(res.status).toBe(403);
  });

  // -------------------------------------------------------------------------
  // View / Edit / Update / Delete
  // -------------------------------------------------------------------------

  describe("with an existing note", () => {
    let noteId: string;

    beforeEach(async () => {
      const now = Math.floor(Date.now() / 1000);
      noteId = crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO notes (id, user_id, title, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
      )
        .bind(noteId, user.id, "Original Title", "Original body", now, now)
        .run();
    });

    it("GET /notes/:id shows the note", async () => {
      const res = await SELF.fetch(`http://localhost/notes/${noteId}`, {
        headers: { Cookie: cookies },
      });
      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toContain("Original Title");
      expect(body).toContain("Original body");
    });

    it("GET /notes/:id/edit shows the pre-filled form", async () => {
      const res = await SELF.fetch(`http://localhost/notes/${noteId}/edit`, {
        headers: { Cookie: cookies },
      });
      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toContain("Original Title");
    });

    it("POST /notes/:id updates the note and redirects", async () => {
      const { body, csrfCookie } = formBodyWithCsrf({
        title: "Updated Title",
        body: "Updated body",
      });

      const res = await SELF.fetch(`http://localhost/notes/${noteId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: `${cookies}; ${csrfCookie}`,
        },
        body,
        redirect: "manual",
      });

      expect(res.status).toBe(302);
      expect(res.headers.get("Location")).toBe(`/notes/${noteId}`);

      const row = await env.DB.prepare("SELECT title FROM notes WHERE id = ?")
        .bind(noteId)
        .first<{ title: string }>();
      expect(row?.title).toBe("Updated Title");
    });

    it("POST /notes/:id/delete removes the note and redirects to /notes", async () => {
      const { body, csrfCookie } = formBodyWithCsrf({});

      const res = await SELF.fetch(`http://localhost/notes/${noteId}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: `${cookies}; ${csrfCookie}`,
        },
        body,
        redirect: "manual",
      });

      expect(res.status).toBe(302);
      expect(res.headers.get("Location")).toBe("/notes");

      const row = await env.DB.prepare("SELECT id FROM notes WHERE id = ?")
        .bind(noteId)
        .first();
      expect(row).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Ownership enforcement
  // -------------------------------------------------------------------------

  describe("ownership enforcement", () => {
    let otherUser: TestUser;
    let otherCookies: string;
    let otherNoteId: string;

    beforeEach(async () => {
      otherUser = await createTestUser();
      otherCookies = await loginAs(otherUser.username, otherUser.password);

      const now = Math.floor(Date.now() / 1000);
      otherNoteId = crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO notes (id, user_id, title, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
      )
        .bind(otherNoteId, otherUser.id, "Other's Note", "secret", now, now)
        .run();
    });

    afterEach(async () => {
      await deleteTestUser(otherUser.id);
    });

    it("cannot view another user's note (404)", async () => {
      const res = await SELF.fetch(
        `http://localhost/notes/${otherNoteId}`,
        { headers: { Cookie: cookies } }
      );
      expect(res.status).toBe(404);
    });

    it("cannot edit another user's note (404)", async () => {
      const res = await SELF.fetch(
        `http://localhost/notes/${otherNoteId}/edit`,
        { headers: { Cookie: cookies } }
      );
      expect(res.status).toBe(404);
    });

    it("cannot delete another user's note (404)", async () => {
      const { body, csrfCookie } = formBodyWithCsrf({});
      const res = await SELF.fetch(
        `http://localhost/notes/${otherNoteId}/delete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: `${cookies}; ${csrfCookie}`,
          },
          body,
          redirect: "manual",
        }
      );
      expect(res.status).toBe(404);
    });
  });
});
