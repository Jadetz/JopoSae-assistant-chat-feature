import pool from "../db.js";
const getFaqs = async () => {
  const result = await pool.query(` SELECT 
            f.question,
            f.answer,
            s.name
            FROM faqs f
            LEFT JOIN services s ON f.service_id = s.id
        ;`);
  return result.rows;
};

const findActiveFaqsByServiceId = async (serviceId) => {
  const query = `
  SELECT
  id, 
  question, 
  answer
  FROM faqs
  WHERE service_id = $1 AND is_active = TRUE
  ORDER BY id ASC;
  `;
  const values = [serviceId];
  const result = await pool.query(query, values);
  return result.rows;
};
export { getFaqs, findActiveFaqsByServiceId };
