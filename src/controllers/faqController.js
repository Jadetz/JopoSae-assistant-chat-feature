import { getFaqs } from "../repositories/faqsRepository.js";

const getAllFaqs = async (req, res) => {
  try {
    const getFaqsResult = await getFaqs();
    res.status(200).json({
      success: true,
      message: "Daftar FAQ berhasil diambil.",
      data: getFaqsResult,
    });
  } catch (error) {
    console.error("Failed retrieved successfully", error.message);

    res.status(500).json({
      success: false,
      message: "Mohon maaf, daftar FAQ gagal diambil.",
    });
  }
};

export { getAllFaqs };
