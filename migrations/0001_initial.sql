-- Migration: 0001_initial
-- Creates the users table for authentication

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,            -- UUID, generated in app via crypto.randomUUID()
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL     -- Unix timestamp (seconds)
);
