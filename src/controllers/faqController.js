import { getFaqs } from "../repositories/faqsRepository.js";

const getAllFaqs = async (req, res) => {
  try {
    const getFaqsResult = await getFaqs();
    res.status(200).json({
      success: true,
      message: "FAQs retrieved succesfully",
      data: getFaqsResult,
    });
  } catch (error) {
    console.error("Failed retrieved successfully", error.message);

    res.status(500).json({
      status: false,
      message: "Failed to retrieve service",
    });
  }
};

export { getAllFaqs };
