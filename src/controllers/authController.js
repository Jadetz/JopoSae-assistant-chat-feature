import ERROR_CODES from "../lib/errorCodes.js";
import { sendError, sendSuccess } from "../lib/respond.js";
import { SESSION_COOKIE_NAME } from "../lib/sessionToken.js";
import { loginWithGoogle, logoutSession } from "../services/authService.js";

// Same options when setting and clearing: a browser removes a cookie only when path and flags match.
// httpOnly keeps the token away from page scripts; secure and lax keep it off plain HTTP and cross-site posts.
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
};
// POST /api/auth/google, body {credential}: the ID token from the Google sign-in button.
const handleGoogleLogin = async (req, res) => {
  const { credential } = req.body ?? {};
  if (typeof credential !== "string" || credential.trim() === "") {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.API_BAD_REQUEST,
      message: "Mohon maaf, data login tidak lengkap. Silakan coba lagi.",
    });
  }
  const result = await loginWithGoogle(credential);
  if (!result.success) {
    return sendError(res, {
      status: result.statusCode,
      code: result.code,
      message: result.message,
    });
  }
  res.cookie(SESSION_COOKIE_NAME, result.session.token, {
    ...SESSION_COOKIE_OPTIONS,
    expires: result.session.expiresAt,
  });

  return sendSuccess(res, {
    message: result.message,
    data: result.data,
  });
};

// GET /api/auth/me: the admin that requireAdmin put on req.
const handleGetMe = (req, res) => {
  sendSuccess(res, {
    message: "Data admin berhasil diambil.",
    data: {
      admin: req.admin,
    },
  });
};

// POST /api/auth/logout: public, so an expired session can still log out cleanly.
const handleLogout = async (req, res) => {
  await logoutSession(req.cookies?.[SESSION_COOKIE_NAME]);
  res.clearCookie(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS);
  return sendSuccess(res, {
    message: "Logout berhasil.",
  });
};

export { handleGoogleLogin, handleGetMe, handleLogout };
