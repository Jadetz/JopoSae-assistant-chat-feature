import { findActiveByKey } from "../repositories/serviceRepository.js";
import { findConversationById } from "../repositories/conversationRepository.js";
import {
  createConsultation,
  findConsultations,
  findConsultationById,
  updateConsultationStatus,
} from "../repositories/consultationRepository.js";
const requestConsultation = async (conversationId, serviceKey) => {
  const conversation = await findConversationById(conversationId);
  if (!conversation) {
    return {
      success: false,
      message: "Percakapan tidak ditemukan",
    };
  }

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
    message: "Permintaan konsultasi berhasil dibuat",
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
      message: "Status konsultasi tidak valid",
    };
  }
  const findConsultationResult = await findConsultations(
    normalizedStatus || null,
  );
  return {
    success: true,
    message: "Daftar konsultasi berhasil diambil",
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
      message: "ID konsultasi tidak valid",
    };
  }

  const findConsultationByIdResult = await findConsultationById(numericId);
  if (findConsultationByIdResult === null) {
    return {
      success: false,
      statusCode: 404,
      message: "Konsultasi tidak ditemukan",
    };
  }
  return {
    success: true,
    message: "Data konsultasi berhasil ditemukan",
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
      message: "ID konsultasi tidak valid",
    };
  }
  const validateStatus = ["pending", "link_generated", "closed", "cancelled"];
  if (!validateStatus.includes(status)) {
    return {
      success: false,
      statusCode: 400,
      message: "Pesan status tidak valid",
    };
  }
  const updateResult = await updateConsultationStatus(numericId, status);
  if (updateResult === null) {
    return {
      success: false,
      statusCode: 404,
      message: "Pesan konsultasi tidak ditemukan",
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Pesan berhasil, dan data berisi hasil update",
    data: updateResult,
  };
};
export {
  requestConsultation,
  getConsultations,
  getConsultationById,
  requestUpdateConsultationStatus,
};
