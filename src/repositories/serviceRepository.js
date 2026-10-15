import pool from "../db.js";
const findAllActive = async () => {
  const result = await pool.query(`
    SELECT
    id,
    service_key,
    name,
    description 
    FROM services
    WHERE is_active = TRUE
    ORDER BY sort_order ASC
    `);
  return result.rows;
};

const findActiveByKey = async (serviceKey) => {
  const result = await pool.query(
    `
    SELECT 
    id,
    service_key,
    name,
    description
    FROM services  
    WHERE service_key = $1 AND is_active = TRUE`,
    [serviceKey],
  );
  return result.rows[0] ?? null;
};

export { findAllActive, findActiveByKey };
