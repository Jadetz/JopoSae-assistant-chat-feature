import { createHash, randomBytes } from "node:crypto";

// Cookie that carries the raw session token. Task 12 reads the same name.
const SESSION_COOKIE_NAME = "joposae_session";

// 32 random bytes as 64 hex characters. The raw value lives only in the cookie.
const createSessionToken = () => randomBytes(32).toString("hex");

// SHA-256 of the raw token, as 64 hex characters. This is the only form stored in admin_sessions.
const hashSessionToken = (token) =>
  createHash("sha256").update(token).digest("hex");

export { SESSION_COOKIE_NAME, createSessionToken, hashSessionToken };
