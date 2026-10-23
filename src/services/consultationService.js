import { findActiveByKey } from "../repositories/serviceRepository.js";
import { findConversationById } from "../repositories/conversationRepository.js";
import {
  createConsultation,
  findConsultations,
  findConsultationById,
  updateConsultationStatus,
  findOpenConsultation,
} from "../repositories/consultationRepository.js";

// create consultation to admin
const buildAdminLink = (text) => {
  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
  if (!adminNumber) {
    throw new Error("ADMIN_WHATSAPP_NUMBER is not set");
  }
  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(text)}`;
};

const requestConsultationLink = async (conversationId, service) => {
  const link = buildAdminLink(
    `Halo, saya ingin konsultasi layanan ${service.name}.`,
  );
  const open = await findOpenConsultation(conversationId, service.id);
  const consultation =
    open ?? (await createConsultation(conversationId, service.id));
  await updateConsultationStatus(consultation.id, "link_generated");
  return link;
};
const requestConsultation = async (conversationId, serviceKey) => {
  const conversation = await findConversationById(conversationId);
  if (!conversation) {
    return {
      success: false,
      message: "Mohon maaf, percakapan tidak ditemukan.",
    };
  }

  const service = await findActiveByKey(serviceKey);
  if (!service) {
    return {
      success: false,
      message: "Mohon maaf, layanan tidak tersedia.",
    };
  }
  const consultation = await createConsultation(conversationId, service.id);
  return {
    success: true,
    message: "Permintaan konsultasi berhasil dibuat.",
    data: consultation,
  };
};

const getConsultations = async (status) => {
  const validStatuses = ["pending", "link_generated", "closed", "cancelled"];
  // Empty or whitespace-only status means "no filter"
  const normalizedStatus = typeof status === "string" ? status.trim() : status;
  if (normalizedStatus && !validStatuses.includes(normalizedStatus)) {
    return {
      success: false,
      message: "Mohon maaf, status konsultasi tidak valid.",
    };
  }
  const findConsultationResult = await findConsultations(
    normalizedStatus || null,
  );
  return {
    success: true,
    message: "Daftar konsultasi berhasil diambil.",
    data: findConsultationResult,
  };
};

const getConsultationById = async (id) => {
  // string to number
  const numericId = Number(id);
  const isValidId = Number.isInteger(numericId) && numericId > 0;

  if (!isValidId) {
    return {
      success: false,
      statusCode: 400,
      message: "Mohon maaf, ID konsultasi tidak valid.",
    };
  }

  const findConsultationByIdResult = await findConsultationById(numericId);
  if (findConsultationByIdResult === null) {
    return {
      success: false,
      statusCode: 404,
      message: "Mohon maaf, data konsultasi tidak ditemukan.",
    };
  }
  return {
    success: true,
    message: "Data konsultasi berhasil ditemukan.",
    data: findConsultationByIdResult,
  };
};

const requestUpdateConsultationStatus = async (id, status) => {
  console.log("Service patch status jalan...");
  const numericId = Number(id);
  const isValidId = Number.isInteger(numericId) && numericId > 0;

  if (!isValidId) {
    return {
      success: false,
      statusCode: 400,
      message: "Mohon maaf, ID konsultasi tidak valid.",
    };
  }
  const validateStatus = ["pending", "link_generated", "closed", "cancelled"];
  if (!validateStatus.includes(status)) {
    return {
      success: false,
      statusCode: 400,
      message: "Mohon maaf, status konsultasi tidak valid.",
    };
  }
  const updateResult = await updateConsultationStatus(numericId, status);
  if (updateResult === null) {
    return {
      success: false,
      statusCode: 404,
      message: "Mohon maaf, data konsultasi tidak ditemukan.",
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Status konsultasi berhasil diperbarui.",
    data: updateResult,
  };
};
export {
  requestConsultation,
  getConsultations,
  getConsultationById,
  requestUpdateConsultationStatus,
  buildAdminLink,
  requestConsultationLink,
};
