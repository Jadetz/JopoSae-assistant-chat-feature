import {
  findAllActive,
  findActiveById,
} from "../repositories/serviceRepository.js";
import { updateConversationState } from "../repositories/conversationRepository.js";
import { findActiveFaqsByServiceId } from "../repositories/faqsRepository.js";
import { requestConsultationLink } from "./consultationService.js";

// Each show* function saves where the customer is now, then returns the text to send

const showMainMenu = async (conversation) => {
  const services = await findAllActive();
  if (services.length === 0) {
    return `_Mohon maaf, saat ini belum ada layanan yang tersedia_`;
  }
  await updateConversationState(conversation.id, "main_menu", null);
  const lines = services.map((service, index) => {
    const summary = service.summary
      ? `_${service.summary}_`
      : "_Ringkasan layanan belum tersedia_";
    return `${index + 1}. *${service.name}*
    ${summary} \n`;
  });
  return [
    "👋🏻Halo! Selamat datang di *JopoSae Labs Digital Platform*.",
    "",
    "*JopoSae Labs Digital Platform* adalah platform digital yang menyediakan solusi untuk kebutuhan pengelolaan layanan dan transaksi.",
    "",
    "_Kami menyediakan beberapa layanan untuk mitra dan pelanggan. Silakan pilih layanan yang ingin Anda ketahui:_",
    "",
    ...lines,
    `*Ketik angka 1–${services.length} untuk memilih layanan.*`,
    "_Ketik layanan untuk kembali ke menu utama._",
  ].join("\n");
};

const showServiceMenu = async (conversation, service) => {
  await updateConversationState(conversation.id, "service_menu", service.id);
  let summary;
  if (service.summary) {
    summary = `_${service.summary}_`;
  } else {
    summary = "Ringkasan layanan belum tersedia";
  }
  return [
    `*${service.name}*`,
    "",
    summary,
    "",
    "Apa yang ingin Anda lakukan?",
    "",
    "1. Lihat informasi layanan",
    "2. Konsultasi dengan admin",
    "3. Kembali ke menu utama",
    "",
    "*Ketik angka 1-3 untuk memilih layanan.*",
    "_Ketik layanan untuk kembali ke menu utama._",
  ].join("\n");
};

const showServiceInfo = async (conversation, service) => {
  await updateConversationState(conversation.id, "service_info", service.id);
  return [
    `*Informasi ${service.name}*`,
    "",
    service.description ?? "Mohon maaf, Informasi layanan belum tersedia",
    "",
    "Untuk mengetahui fitur, mekanisme penggunaan, atau kesesuaian layanan dengan kebutuhan Anda, silakan pilih:",
    "",
    "1. Tanya tentang cara kerja layanan",
    "2. Konsultasi dengan admin",
    `3. Kembali ke kategori ${service.name}`,
    "4. Menu utama",
    "",
    "*Ketik angka 1-4 untuk memilih layanan.*",
    "_Ketik layanan untuk kembali ke menu utama._",
  ].join("\n");
};

const showFaqList = async (conversation, service, faqs) => {
  await updateConversationState(conversation.id, "faq_list", service.id);
  const lines = faqs.map((faq, index) => `${index + 1}. ${faq.question}`);
  return [
    `*Pertanyaan seputar ${service.name}*`,
    "",
    ...lines,
    "0. Kembali ke informasi layanan",
    "",
    "*Silakan balas dengan nomor pertanyaan*",
    "_Ketik layanan untuk kembali ke menu utama._",
  ].join("\n");
};

const showConsultation = async (conversation, service) => {
  const link = await requestConsultationLink(conversation.id, service);
  await updateConversationState(conversation.id, "main_menu", null);
  return [
    `Baik, Anda akan diarahkan ke admin JopoSae untuk konsultasi mengenai *${service.name}*.`,
    "",
    "Silakan klik tautan berikut untuk menghubungi admin kami:",
    link,
    "",
    "Pesan konsultasi sudah disiapkan. Setelah WhatsApp terbuka, silakan tekan *Kirim* untuk memulai percakapan dengan admin kami.",
    "",
    "_Ketik layanan untuk kembali ke menu utama._",
  ].join("\n");
};

// Wrong choice: say so, then show the same screen again
const invalidChoice = (screen) =>
  `_Mohon maaf, pilihan tidak tersedia.\n\n${screen}_`;

// session = { conversation, origin } from conversationService, decided in bot.js
const buildReply = async (incoming, session) => {
  const text = (incoming.text ?? "").trim().toLowerCase();
  const { conversation } = session;

  if (text === "layanan") {
    return showMainMenu(conversation);
  }

  // Any text that is not a service number shows the menu, including the first message
  if (conversation.current_state === "main_menu") {
    const services = await findAllActive();
    const service = services[Number(text) - 1];
    if (!service) {
      return showMainMenu(conversation);
    }
    return showServiceMenu(conversation, service);
  }

  // The other screens belong to the service chosen earlier
  const service = await findActiveById(conversation.selected_service_id);
  if (!service) {
    return showMainMenu(conversation);
  }

  if (conversation.current_state === "service_menu") {
    if (text === "1") {
      return showServiceInfo(conversation, service);
    }
    if (text === "2") {
      return showConsultation(conversation, service);
    }
    if (text === "3") {
      return showMainMenu(conversation);
    }
    return invalidChoice(await showServiceMenu(conversation, service));
  }

  if (conversation.current_state === "service_info") {
    if (text === "1") {
      const faqs = await findActiveFaqsByServiceId(service.id);
      if (faqs.length === 0) {
        return [
          "Mohon maaf, belum ada daftar pertanyaan untuk layanan ini.",
          "",
          await showServiceInfo(conversation, service),
        ].join("\n");
      }
      return showFaqList(conversation, service, faqs);
    }
    if (text === "2") {
      return showConsultation(conversation, service);
    }
    if (text === "3") {
      return showServiceMenu(conversation, service);
    }
    if (text === "4") {
      return showMainMenu(conversation);
    }
    return invalidChoice(await showServiceInfo(conversation, service));
  }

  if (conversation.current_state === "faq_list") {
    if (text === "0") {
      return showServiceInfo(conversation, service);
    }
    const faqs = await findActiveFaqsByServiceId(service.id);
    const faq = faqs[Number(text) - 1];
    if (!faq) {
      return invalidChoice(await showFaqList(conversation, service, faqs));
    }
    return [
      `*${faq.question}*`,
      faq.answer,
      "",
      await showFaqList(conversation, service, faqs),
    ].join("\n");
  }

  // Unknown or old state (e.g. service_list): start again from the menu
  return showMainMenu(conversation);
};

export { buildReply };
