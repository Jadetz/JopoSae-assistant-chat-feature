import pool from "../db.js";

const upsertContact = async (whatsappNumber, displayName) => {
  const query = `
  INSERT INTO contacts (whatsapp_number, display_name)
  VALUES ($1, $2)
  ON CONFLICT (whatsapp_number)
  DO UPDATE SET display_name = COALESCE(EXCLUDED.display_name, contacts.display_name)
  RETURNING id, whatsapp_number, display_name;
  `;
  const values = [whatsappNumber, displayName];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export { upsertContact };
