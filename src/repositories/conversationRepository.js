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

const findActiveConversationByContactId = async (contactId) => {
  const query = `
  SELECT id, contact_id, status, current_state, selected_service_id
  FROM conversations
  WHERE contact_id = $1 AND status = 'active'
  ORDER BY id DESC
  LIMIT 1;`;

  const values = [contactId];
  const result = await pool.query(query, values);
  return result.rows[0] ?? null;
};

const createConversation = async (contactId) => {
  const query = `
  INSERT INTO conversations (contact_id)
  VALUES ($1)
  RETURNING id, contact_id, status, current_state, selected_service_id;
  `;
  const values = [contactId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateConversationState = async (id, currentState, selectedServiceId) => {
  const query = `
  UPDATE conversations
  SET current_state = $2, selected_service_id  = $3
  WHERE id = $1
  RETURNING id, contact_id, status, current_state, selected_service_id; 
  `;
  const values = [id, currentState, selectedServiceId];
  const result = await pool.query(query, values);
  return result.rows[0] ?? null;
};
export {
  findConversationById,
  findActiveConversationByContactId,
  createConversation,
  updateConversationState,
};
