import { findAllActive } from "../repostitories/serviceRepository.js";

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

export { getServices };
