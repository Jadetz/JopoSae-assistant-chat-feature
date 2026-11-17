import { withTransaction } from "../db.js";
import logger from "../lib/logger.js";
import { verifyGoogleIdToken } from "../adapters/google/idTokenVerifier.js";
import { createSessionToken, hashSessionToken } from "../lib/sessionToken.js";
import {
  findAdminByGoogleSub,
  findAdminByEmail,
  recordAdminLogin,
} from "../repositories/adminRepository.js";
import {
  deleteExpiredSessions,
  createSession,
  deleteSessionByTokenHash,
} from "../repositories/adminSessionRepository.js";
import { isAllowedGoogleAccount } from "../lib/googleAccountFilter.js";
import ERROR_CODES from "../lib/errorCodes.js";
const log = logger.child({
  component: "auth",
});
// Fixed session length; expires_at is set at login and never extended.
const SESSION_TTL_DAYS = 7;

const INVALID_TOKEN_MESSAGE =
  "Mohon maaf, login Google gagal. Silakan coba lagi.";
const UNVERIFIED_EMAIL_MESSAGE =
  "Mohon maaf, email akun Google Anda belum terverifikasi. Verifikasi email di akun Google terlebih dahulu, lalu coba lagi.";
// One text for every "not on the list" case, so the login page never reveals
// which emails are registered, revoked, or tied to another Google account.
const NOT_ALLOWED_MESSAGE =
  "Mohon maaf, email ini belum terdaftar sebagai admin. Silakan minta owner menambahkan email Anda.";

// Logs the reason by code only (no email, no token), then returns the failure for the controller.
const reject = (statusCode, code, message, adminId = null) => {
  log.warn(
    {
      code,
      admin_id: adminId,
    },
    "Login rejected",
  );
  return {
    success: false,
    statusCode,
    code,
    message,
  };
};

const loginWithGoogle = async (credential) => {
  const identity = await verifyGoogleIdToken(credential);
  if (!identity) {
    return reject(401, ERROR_CODES.AUTH_INVALID_TOKEN, INVALID_TOKEN_MESSAGE);
  }
  if (identity.email_verified !== true) {
    return reject(
      403,
      ERROR_CODES.AUTH_EMAIL_UNVERIFIED,
      UNVERIFIED_EMAIL_MESSAGE,
    );
  }
  const email = identity.email.trim().toLowerCase();
  if (!isAllowedGoogleAccount(identity.hd, email)) {
    return reject(
      403,
      ERROR_CODES.AUTH_DOMAIN_NOT_ALLOWED,
      NOT_ALLOWED_MESSAGE,
    );
  }
  // The token check above may wait on the network, so the transaction opens only now.
  return withTransaction(async (client) => {
    const admin =
      (await findAdminByGoogleSub(identity.sub, client)) ??
      (await findAdminByEmail(email, client));
    if (!admin) {
      return reject(403, ERROR_CODES.AUTH_NOT_REGISTERED, NOT_ALLOWED_MESSAGE);
    }
    if (admin.google_sub !== null && admin.google_sub !== identity.sub) {
      return reject(
        403,
        ERROR_CODES.AUTH_ACCOUNT_MISMATCH,
        NOT_ALLOWED_MESSAGE,
        admin.id,
      );
    }
    if (admin.revoked_at !== null) {
      return reject(
        403,
        ERROR_CODES.AUTH_ACCESS_REVOKED,
        NOT_ALLOWED_MESSAGE,
        admin.id,
      );
    }
    const profile = await recordAdminLogin(
      admin.id,
      identity.sub,
      identity.name ?? null,
      client,
    );
    await deleteExpiredSessions(admin.id, client);
    const token = createSessionToken();
    const session = await createSession(
      admin.id,
      hashSessionToken(token),
      SESSION_TTL_DAYS,
      client,
    );
    log.info(
      {
        admin_id: admin.id,
      },
      "Admin signed in",
    );
    return {
      success: true,
      message: "Login berhasil.",
      data: {
        admin: profile,
      },
      session: {
        token,
        expiresAt: session.expires_at,
      },
    };
  });
};
// Deletes the session behind this cookie value, if any. Safe to call twice.
const logoutSession = async (token) => {
  if (typeof token !== "string" || token === "") {
    return;
  }
  const adminId = await deleteSessionByTokenHash(hashSessionToken(token));
  if (adminId) {
    log.info({ admin_id: adminId }, "Admin signed out");
  }
};
export { loginWithGoogle, logoutSession };
