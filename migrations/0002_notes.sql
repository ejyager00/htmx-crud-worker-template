-- Notes table: per-user markdown/text notes
CREATE TABLE IF NOT EXISTS notes (
  id         TEXT    PRIMARY KEY,
  user_id    TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT    NOT NULL,
  body       TEXT    NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
