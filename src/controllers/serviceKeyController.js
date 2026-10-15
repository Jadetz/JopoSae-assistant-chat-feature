import pool from "../db.js";

const getServiceByKey = async (req, res) => {
  const serviceKey = req.params.service_key;
  // Query database
  try {
    const result = await pool.query(
      `SELECT id, service_key, name, description
       FROM services
       WHERE service_key = $1
         AND is_active = TRUE`,
      [serviceKey],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Service retrieved successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to retrieve service", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { getServiceByKey };
