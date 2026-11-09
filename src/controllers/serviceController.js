import {
  findAllActive,
  findActiveByKey,
} from "../repositories/serviceRepository.js";
import ERROR_CODES from "../lib/errorCodes.js";
import { sendSuccess, sendError } from "../lib/respond.js";

const getServices = async (req, res) => {
  const services = await findAllActive();
  sendSuccess(res, {
    message: "Daftar layanan berhasil diambil.",
    data: services,
  });
};
const getServiceByKey = async (req, res) => {
  const { service_key } = req.params;
  const service = await findActiveByKey(service_key);
  if (!service) {
    return sendError(res, {
      status: 404,
      code: ERROR_CODES.API_NOT_FOUND,
      message: "Mohon maaf, layanan tidak ditemukan.",
    });
  }
  return sendSuccess(res, {
    message: "Data layanan berhasil diambil.",
    data: service,
  });
};

export { getServices, getServiceByKey };
