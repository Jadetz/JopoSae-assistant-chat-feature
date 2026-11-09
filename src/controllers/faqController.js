import { getFaqs } from "../repositories/faqsRepository.js";
import { sendSuccess } from "../lib/respond.js";

const getAllFaqs = async (req, res) => {
  const faqs = await getFaqs();
  sendSuccess(res, {
    message: "Daftar FAQ berhasil diambil.",
    data: faqs,
  });
};

export { getAllFaqs };
