import pool from "../db.js";

// bot_status has exactly one row (id 1): create it the first time, update it after that
const saveConnectionState = async (connectionState) => {
  const query = `
  INSERT INTO bot_status (id, connection_state, state_changed_at, last_seen_at)
  VALUES (1, $1, now(), now())
  ON CONFLICT (id) DO UPDATE
  SET connection_state = EXCLUDED.connection_state,
    state_changed_at = EXCLUDED.state_changed_at,
    last_seen_at = EXCLUDED.last_seen_at
  RETURNING connection_state, state_changed_at, last_seen_at;
  `;
  const values = [connectionState];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Heartbeat: the bot is still alive
const touchLastSeen = async () => {
  const query = `
  UPDATE bot_status
  SET last_seen_at = now()
  WHERE id = 1
  RETURNING last_seen_at;
  `;
  const result = await pool.query(query);
  return result.rows[0] ?? null;
};

export { saveConnectionState, touchLastSeen };
