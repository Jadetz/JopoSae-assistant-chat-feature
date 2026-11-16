// Login sessions (migration 001). Only token hashes are stored, never the raw cookie value.
// Every function takes the transaction client from withTransaction as db.

// Expired rows of one admin are removed at each of that admin's logins, so the table does not pile up.
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

export { deleteExpiredSessions, createSession };
