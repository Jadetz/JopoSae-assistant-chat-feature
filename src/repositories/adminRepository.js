// Admins who may sign in to the dashboard (migration 001).
// Lookups lock the row with FOR UPDATE, so a login and a revoke on the same admin run one after the other.
// Every function takes the transaction client from withTransaction as db; none of them uses the pool.

const findAdminByGoogleSub = async (googleSub, db) => {
  const query = `
    SELECT id, email, name, role, google_sub, revoked_at
    FROM admins
    WHERE google_sub = $1
    FOR UPDATE;
    `;
  const result = await db.query(query, [googleSub]);
  return result.rows[0] ?? null;
};
const findAdminByEmail = async (email, db) => {
  const query = `
    SELECT id, email, name, role, google_sub, revoked_at
    FROM admins
    WHERE email = $1
    FOR UPDATE;
    `;
  const result = await db.query(query, [email]);
  return result.rows[0] ?? null;
};

// First login fills google_sub; every login refreshes name from the token and last_login_at.
const recordAdminLogin = async (adminId, googleSub, name, db) => {
  const query = `
    UPDATE admins
    SET google_sub = $2,
    name = $3,
    last_login_at = now()
    WHERE id = $1
    RETURNING id, email, name, role;
    `;
  const result = await db.query(query, [adminId, googleSub, name]);
  return result.rows[0];
};

export { findAdminByGoogleSub, findAdminByEmail, recordAdminLogin };
