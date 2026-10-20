import pool from "../db.js";
const createConsultation = async (conversationId, serviceId) => {
  const query = ` INSERT INTO consultation_requests (
      conversation_id,
      service_id
    )
    VALUES ($1, $2)
    RETURNING *;
  `;

  const values = [conversationId, serviceId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const findConsultations = async (status) => {
  const query = `
  SELECT
    cr.id AS consultation_id,
    c.whatsapp_number,
    c.display_name,
    s.name AS service_name,
    cr.topic,
    cr.status AS consultation_status,
    conv.status AS conversation_status,
    cr.created_at
FROM consultation_requests AS cr
JOIN conversations AS conv
    ON cr.conversation_id = conv.id
JOIN contacts AS c
    ON conv.contact_id = c.id
LEFT JOIN services AS s
    ON cr.service_id = s.id
WHERE ($1::consultation_status IS NULL OR cr.status = $1)
ORDER BY cr.created_at DESC;
`;
  const values = [status ?? null];
  const result = await pool.query(query, values);
  return result.rows;
};

const findConsultationById = async (id) => {
  const query = `
   SELECT
    cr.id AS consultation_id,
    c.whatsapp_number,
    c.display_name,
    s.name AS service_name,
    cr.topic,
    cr.status AS consultation_status,
    conv.status AS conversation_status,
    cr.created_at
FROM consultation_requests AS cr
JOIN conversations AS conv
    ON cr.conversation_id = conv.id
JOIN contacts AS c
    ON conv.contact_id = c.id
LEFT JOIN services AS s
    ON cr.service_id = s.id
WHERE cr.id =$1;`;
  const values = [id ?? null];
  const result = await pool.query(query, values);
  return result.rows[0] ?? null;
};

//update secara patch
const updateConsultationStatus = async (id, status) => {
  const query = `
  UPDATE consultation_requests
  SET status = $1
  WHERE id = $2
  RETURNING *;
  `;
  const values = [status, id];
  const result = await pool.query(query, values);
  return result.rows[0] ?? null;
};

export {
  createConsultation,
  findConsultations,
  findConsultationById,
  updateConsultationStatus,
};
