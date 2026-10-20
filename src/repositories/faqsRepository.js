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

export { getFaqs };
