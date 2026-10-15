import pool from "../db.js";

const getServices = async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT 
            id,
            service_key,
            name,
            description
            FROM services
            WHERE is_active = TRUE
            `);
    res.status(200).json({
      success: true,
      message: "Service retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Failed to retrieve service", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve services",
    });
  }
};

export { getServices };
