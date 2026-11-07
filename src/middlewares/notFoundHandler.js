import ERROR_CODES from "../lib/errorCodes.js";
import { sendError } from "../lib/respond.js";

const notFoundHandler = (req, res) => {
  sendError(res, {
    status: 404,
    code: ERROR_CODES.API_ROUTE_NOT_FOUND,
    message: "Mohon maaf, alamaat yang diminta tidak ditemukan",
  });
};

export default notFoundHandler;
