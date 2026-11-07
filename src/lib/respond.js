// One response shape for every endpoint: success carries data,
// failure carries error.code, and only a 500 adds error.ref_code.

const sendSuccess = (res, { status = 200, message, data = null }) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, { status, code, message, refCode }) => {
  const error = refCode ? { code, ref_code: refCode } : { code };
  return res.status(status).json({
    success: false,
    message,
    error,
  });
};

export { sendSuccess, sendError };
