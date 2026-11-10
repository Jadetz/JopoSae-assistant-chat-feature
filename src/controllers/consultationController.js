import {
  requestConsultation,
  getConsultations,
  getConsultationById,
  requestUpdateConsultationStatus,
} from "../services/consultationService.js";
import ERROR_CODES from "../lib/errorCodes.js";
import { sendError, sendSuccess } from "../lib/respond.js";

// Services report a failure as { success: false, statusCode?, message };
// only this HTTP layer turns it into an error code.
const sendServiceFailure = (res, result) => {
  if (result.statusCode === 404) {
    return sendError(res, {
      status: 404,
      code: ERROR_CODES.API_NOT_FOUND,
      message: result.message,
    });
  }
  return sendError(res, {
    status: 400,
    code: ERROR_CODES.API_BAD_REQUEST,
    message: result.message,
  });
};
const handleCreateConsultation = async (req, res) => {
  const { conversationId, serviceKey } = req.body ?? {};
  // Validate input
  const numericConversationId = Number(conversationId);
  const isValidConversationId =
    Number.isInteger(numericConversationId) && numericConversationId > 0;
  const isValidServiceKey =
    typeof serviceKey === "string" && serviceKey.trim() !== "";
  if (!isValidConversationId || !isValidServiceKey) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.API_BAD_REQUEST,
      message:
        "Mohon periksa kembali data Anda: conversationId harus berupa bilangan bulat positif dan serviceKey wajib diisi.",
    });
  }
  const result = await requestConsultation(
    numericConversationId,
    serviceKey.trim(),
  );

  if (!result.success) {
    return sendError(res, {
      status: 404,
      code: ERROR_CODES.API_NOT_FOUND,
      message: result.message,
    });
  }
  return sendSuccess(res, {
    status: 201,
    message: result.message,
    data: result.data,
  });
};
const handleGetConsultations = async (req, res) => {
  const { status } = req.query;
  const result = await getConsultations(status);
  if (!result.success) {
    return sendServiceFailure(res, result);
  }
  return sendSuccess(res, {
    message: result.message,
    data: result.data,
  });
};

const handleGetConsultationById = async (req, res) => {
  const { id } = req.params;
  const result = await getConsultationById(id);
  if (!result.success) {
    return sendServiceFailure(res, result);
  }
  return sendSuccess(res, {
    message: result.message,
    data: result.data,
  });
};

const handleUpdateConsultationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body ?? {};
  const result = await requestUpdateConsultationStatus(id, status);
  if (!result.success) {
    return sendServiceFailure(res, result);
  }
  return sendSuccess(res, {
    message: result.message,
    data: result.data,
  });
};
export {
  handleCreateConsultation,
  handleGetConsultations,
  handleGetConsultationById,
  handleUpdateConsultationStatus,
};
