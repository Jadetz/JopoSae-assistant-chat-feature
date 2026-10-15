import { findActiveByKey } from "../repositories/serviceRepository.js";

const getServiceByKey = async (req, res) => {
  const serviceKey = req.params.service_key;
  try {
    const services = await findActiveByKey(serviceKey);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Service retrieved successfully",
      data: services,
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
