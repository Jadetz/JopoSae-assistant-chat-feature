import {
  findAllActive,
  findActiveByKey,
} from "../repositories/serviceRepository.js";

const getServices = async (req, res) => {
  try {
    const services = await findAllActive();
    res.status(200).json({
      success: true,
      message: "Service retrieved successfully",
      data: services,
    });
  } catch (error) {
    console.error("Failed to retrieve service", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve services",
    });
  }
};
const getServiceByKey = async (req, res) => {
  try {
    const { service_key } = req.params;

    console.log("Service key:", service_key);

    const service = await findActiveByKey(service_key);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Layanan tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Get service by key error:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

export { getServices, getServiceByKey };
