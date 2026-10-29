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
const claimActiveConversation = async (
  contactId,
  sentAt,
  idleTimeoutMinutes,
  db = pool,
) => {
  const query = `
  UPDATE conversations
  SET last_activity_at = GREATEST(last_activity_at, $2)
  WHERE contact_id = $1
  AND status = 'active'
  AND $2 < last_activity_at + make_interval(mins => $3)
  RETURNING id, contact_id, status, current_state, selected_service_id;
  `;
  const values = [contactId, sentAt, idleTimeoutMinutes];
  const result = await db.query(query, values);
  return result.rows[0] ?? null;
};
const closeStaleConversation = async (
  contactId,
  sentAt,
  idleTimeoutMinutes,
  db = pool,
) => {
  const query = `
  UPDATE conversations
  SET status = (CASE WHEN handed_off_at IS NULL
  THEN 'closed' ELSE 'handed_off' END)::conversation_status,
  ended_at = last_activity_at,
  closed_at = now(),
  closed_by = 'bot',
  idle_timeout_minutes = $3
  WHERE contact_id = $1
  AND status = 'active'
  AND $2 >= last_activity_at + make_interval(mins => $3)
  RETURNING id;
  `;

  const values = [contactId, sentAt, idleTimeoutMinutes];
  const result = await db.query(query, values);
  return result.rows[0] ?? null;
};
const createConversation = async (contactId, sentAt, db = pool) => {
  const query = `
  INSERT INTO conversations (contact_id, started_at, last_activity_at)
  VALUES ($1, $2, $2)
  RETURNING id, contact_id, status, current_state, selected_service_id;
  `;
  const values = [contactId, sentAt];
  const result = await db.query(query, values);
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

// The conversation this contact ended most recently, to decide whether a new one may resume it
const findLastClosedConversation = async (contactId, db = pool) => {
  const query = `
  SELECT id, current_state, selected_service_id, ended_at
  FROM conversations
  WHERE contact_id = $1 AND status IN ('closed', 'handed_off')
  ORDER BY ended_at DESC NULLS LAST
  LIMIT 1;
  `;
  const values = [contactId];
  const result = await db.query(query, values);
  return result.rows[0] ?? null;
};

const createResumedConversation = async (
  contactId,
  sentAt,
  previous,
  db = pool,
) => {
  const query = `
  INSERT INTO conversations (contact_id, started_at, last_activity_at, current_state, selected_service_id, resumed_from_id)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING id, contact_id, status, current_state, selected_service_id;
  `;
  const values = [
    contactId,
    sentAt,
    previous.current_state,
    previous.selected_service_id,
    previous.id,
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const markHandedOff = async (id, db = pool) => {
  const query = `
  UPDATE conversations
  SET handed_off_at = COALESCE(handed_off_at, now())
  WHERE id = $1
  RETURNING id, handed_off_at;
  `;
  const values = [id];
  const result = await db.query(query, values);
  return result.rows[0] ?? null;
};
export {
  findConversationById,
  findActiveConversationByContactId,
  createConversation,
  updateConversationState,
  claimActiveConversation,
  closeStaleConversation,
  markHandedOff,
  findLastClosedConversation,
  createResumedConversation,
};
