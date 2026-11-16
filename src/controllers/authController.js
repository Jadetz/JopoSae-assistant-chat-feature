import ERROR_CODES from "../lib/errorCodes.js";
import { sendError, sendSuccess } from "../lib/respond.js";
import { SESSION_COOKIE_NAME } from "../lib/sessionToken.js";
import { loginWithGoogle } from "../services/authService.js";

// POST /api/auth/google, body {credential}: the ID token from the Google sign-in button.
const handleGoogleLogin = async (req, res) => {
  const { credential } = req.body ?? {};
  if (typeof credential !== "string" || credential.trim() === "") {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.API_BAD_REQUEST,
      message: "Mohon maaf, data login tidak lengkap. Silakan coba lagi",
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
  // httpOnly keeps the token away from page scripts; secure and lax keep it off plain HTTP and cross-site posts.
  res.cookie(SESSION_COOKIE_NAME, result.session.token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: result.session.expiresAt,
  });

  return sendSuccess(res, {
    message: result.message,
    data: result.data,
  });
};

export { handleGoogleLogin };
