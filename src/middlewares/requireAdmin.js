import logger from "../lib/logger.js";
import ERROR_CODES from "../lib/errorCodes.js";
import { sendError } from "../lib/respond.js";
import { SESSION_COOKIE_NAME, hashSessionToken } from "../lib/sessionToken.js";
import {
  findActiveSessionByTokenHash,
  touchSession,
} from "../repositories/adminSessionRepository.js";

const log = logger.child({
  component: "auth",
});

const SESSION_REQUIRED_MESSAGE =
  "Mohon maaf, sesi login Anda tidak ditemukan atau sudah berakhir. Silakan login kembali.";

const sendSessionRequired = (res) =>
  sendError(res, {
    status: 401,
    code: ERROR_CODES.AUTH_SESSION_REQUIRED,
    message: SESSION_REQUIRED_MESSAGE,
  });

// Lets a request through only with a live session of a non-revoked admin,
// and puts that admin on req.admin for the handlers after it.
const requireAdmin = async (req, res, next) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (typeof token !== "string" || token === "") {
    return sendSessionRequired(res);
  }
  const session = await findActiveSessionByTokenHash(hashSessionToken(token));
  if (!session) {
    log.warn(
      {
        code: ERROR_CODES.AUTH_SESSION_REQUIRED,
      },
      "Session rejected",
    );
    return sendSessionRequired(res);
  }
  await touchSession(session.session_id);
  req.admin = {
    id: session.id,
    email: session.email,
    name: session.name,
    role: session.role,
  };
  return next();
};

export default requireAdmin;
