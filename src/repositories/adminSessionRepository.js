import pool from "../db.js";
// Login sessions (migration 001). Only token hashes are stored, never the raw cookie value.
// Login functions take the transaction client from withTransaction; per-request functions default to the pool.
const deleteExpiredSessions = async (adminId, db) => {
  const query = `
  DELETE FROM admin_sessions
  WHERE admin_id = $1 AND expires_at <= now();
  `;
  await db.query(query, [adminId]); // nothing to return; the service only needs the delete to run.
};

// The database clock decides expires_at; the cookie copies the returned value.
const createSession = async (adminId, tokenHash, ttlDays, db) => {
  const query = `
  INSERT INTO admin_sessions (admin_id, token_hash, expires_at)
  VALUES ($1, $2, now() + make_interval(days => $3))
  RETURNING id, expires_at;
  `;
  const result = await db.query(query, [adminId, tokenHash, ttlDays]);
  return result.rows[0] ?? null;
};
// A live session: not expired, and its admin not revoked. The join is the second check
// after a revoke deletes the sessions (KEPUTUSAN entry 15).
const findActiveSessionByTokenHash = async (tokenHash, db = pool) => {
  const query = `
  SELECT s.id AS session_id, s.last_seen_at, a.id, a.email, a.name, a.role
  FROM admin_sessions AS s
  JOIN admins AS a ON a.id = s.admin_id
  WHERE s.token_hash = $1
  AND s.expires_at > now()
  AND a.revoked_at IS NULL;
  `;
  const result = await db.query(query, [tokenHash]);
  return result.rows[0] ?? null;
};

// last_seen_at moves at most once per 5 minutes, so most requests do not write.
const touchSession = async (sessionId, db = pool) => {
  const query = `
  UPDATE admin_sessions
  SET last_seen_at = now()
  WHERE id = $1 AND last_seen_at < now() - interval '5 minutes';
  `;
  await db.query(query, [sessionId]);
};

// Logout. Returns the admin_id of the deleted row, or null when there was none.
const deleteSessionByTokenHash = async (tokenHash, db = pool) => {
  const query = `
  DELETE FROM admin_sessions
  WHERE token_hash = $1
  RETURNING admin_id;
  `;
  const result = await db.query(query, [tokenHash]);
  return result.rows[0]?.admin_id ?? null;
};
export {
  deleteExpiredSessions,
  createSession,
  findActiveSessionByTokenHash,
  touchSession,
  deleteSessionByTokenHash,
};
