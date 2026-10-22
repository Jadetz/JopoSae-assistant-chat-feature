import { findAllActive } from "../repositories/serviceRepository.js";

const buildReply = async (incoming) => {
  const text = (incoming.text ?? "").trim().toLowerCase();

  if (text === "layanan") {
    const services = await findAllActive();
    if (services.length === 0) {
      return "Mohon maaf, saat ini belum ada layanan yang tersedia";
    }

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
  return "Halo Pelanggan, silahkan ketik *Layanan* untuk melihat layanan kami, terima kasih. ";
};

export { buildReply };
