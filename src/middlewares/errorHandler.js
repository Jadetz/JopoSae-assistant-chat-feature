import { randomInt } from "node:crypto";
import logger from "../lib/logger.js";
import ERROR_CODES from "../lib/errorCodes.js";
import { sendError } from "../lib/respond.js";

const log = logger.child({ component: "http" });

// No 0, O, 1, or I, so an admin can read the code aloud without mix-ups.
const REF_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

const createRefCode = () => {
  let refCode = "E-";
  for (let i = 0; i < 3; i += 1) {
    refCode += REF_CODE_ALPHABET[randomInt(REF_CODE_ALPHABET.length)];
  }
  return refCode;
};

// Express treats a middleware as an error handler only when it takes four parameters.
const errorHandler = (err, req, res, next) => {
  const endpoint = `${req.method} ${req.originalURL.split("?")[0]}`;
  if (err.type === "entity.parse.failed") {
    log.warn(
      {
        code: ERROR_CODES.API_INVALID_JSON,
        endpoint,
      },
      "Invalid JSON body",
    );
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.API_INVALID_JSON,
      message: "Mohon maaf, format data yang dikirim tidak valid.",
    });
  }
  if (err.status >= 400 && err.status < 500) {
    log.warn(
      {
        code: ERROR_CODES.API_BAD_REQUEST,
        status: err.status,
        endpoint,
      },
      "Rejected request",
    );
    return sendError(res, {
      status: err.status,
      code: ERROR_CODES.API_BAD_REQUEST,
      message: "Mohon maaf, permintaan tidak dapat diproses.",
    });
  }
  const refCode = createRefCode();
  log.error(
    {
      err,
      code: ERROR_CODES.API_500,
      refCode: refCode,
      endpoint,
    },
    "Unhandled error",
  );
  return sendError(res, {
    status: 500,
    code: ERROR_CODES.API_500,
    message:
      "Mohon maaf, terjadi kesalahan pada server. Silahkan coba beberapa saat lagi.",
    refCode,
  });
};

export default errorHandler;
