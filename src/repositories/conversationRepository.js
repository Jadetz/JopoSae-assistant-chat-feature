import pool from "../db.js";

const findConversationById = async (id) => {
  const query = `
    SELECT
    id,
    status
    FROM conversations
    WHERE id = $1`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0] ?? null;
};

export { findConversationById };
