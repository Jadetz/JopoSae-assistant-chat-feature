import { findActiveByKey } from "../repositories/serviceRepository.js";
import { createConsultation } from "../repositories/consultationRepository.js";
const requestConsultation = async (conversationId, serviceKey) => {
  const service = await findActiveByKey(serviceKey);
  if (!service) {
    return {
      success: false,
      message: "Layanan tidak tersedia",
    };
  }
  const consultation = await createConsultation(conversationId, service.id);
  return {
    success: true,
    message: "Permintaan konsultasi dapat dibuat",
    data: consultation,
  };
};

export { requestConsultation };
