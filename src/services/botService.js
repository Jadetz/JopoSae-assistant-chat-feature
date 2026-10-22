import { findAllActive } from "../repositories/serviceRepository.js";
import { updateConversationState } from "../repositories/conversationRepository.js";
import { findOrStartConversation } from "./conversationService.js";

const buildReply = async (incoming) => {
  const text = (incoming.text ?? "").trim().toLowerCase();
  const conversation = await findOrStartConversation(incoming);
  if (text === "layanan") {
    const services = await findAllActive();
    if (services.length === 0) {
      return "Mohon maaf, saat ini belum ada layanan yang tersedia";
    }
    // langkah 2
    await updateConversationState(conversation.id, "service_list");
    const lines = services.map(
      (service, index) => `${index + 1}. ${service.name}`,
    );
    return [
      "Berikut layanan JopoSae yang tersedia:",
      ...lines,
      "",
      "Silahkan balas dengan nomor layanan untuk melihat detailnya",
    ].join("\n");
  }
  // A number only means something right after the service list was shown
  if (conversation.current_state === "service_list") {
    const services = await findAllActive();
    const service = services[Number(text) - 1];
    if (!service) {
      return "Mohon maaf, nomor layanan tidak ditemukan. Silakan balas dengan nomor yang ada di daftar, atau ketik *Layanan* untuk melihat daftar lagi";
    }
    return [
      `*${service.name}*`,
      service.description ?? "Deskripsi layanan belum tersedia",
      "",
      "Balas nomor lain untuk melihat layanan lain, atau ketik *Layanan* untuk melihat daftar lagi",
    ].join("\n");
  }
  return "Halo Pelanggan, silahkan ketik *Layanan* untuk melihat layanan kami, terima kasih. ";
};

export { buildReply };
