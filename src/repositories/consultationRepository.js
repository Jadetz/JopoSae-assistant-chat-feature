import pool from "../db.js";
const createConsultation = async (conversationId, serviceId) => {
  const result = await pool.query(
    `
        INSERT INTO consultation_requests
        (conversation_id, service_id)
        VALUES
        ($1, $2)
        RETURNING *;
    `,
    [conversationId, serviceId],
  );
  return result.rows[0];
};

export { createConsultation };
