import pool from "../db.js";

const getFaqs = async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT 
            f.question,
            f.answer,
            s.name
            FROM faqs f
            LEFT JOIN services s ON f.service_id = s.id
        `);
    res.status(200).json({
      success: true,
      message: "FAQs retrieved succesfully",
      data: result.rows[1],
    });
  } catch (error) {
    console.error("Failed retrieved successfully", error.message);

    res.status(500).json({
      status: false,
      message: "Failed to retrieve service",
    });
  }
};

export { getFaqs };
