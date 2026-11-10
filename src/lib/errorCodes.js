// Error codes shared by the API and the bot, pattern "<source>.<event>".
// One list so no file mistypes a code; stage 3 (error_events table) reuses it.
const ERROR_CODES = Object.freeze({
  // HTTP (API)
  API_BAD_REQUEST: "api.bad_request",
  API_INVALID_JSON: "api.invalid_json",
  API_NOT_FOUND: "api.not_found",
  API_ROUTE_NOT_FOUND: "api.route_not_found",
  API_500: "api.500",
  // WhatsApp connection
  WA_DISCONNECTED: "wa.disconnected",
  WA_SEND_FAILED: "wa.send_failed",
  WA_PAIRING_FAILED: "wa.pairing_failed",
  WA_RECONNECT_FAILED: "wa.reconnect_failed",
  // Bot process
  BOT_REPLY_FAILED: "bot.reply_failed",
  BOT_START_FAILED: "bot.start_failed",
  // Background jobs
  SWEEPER_FAILED: "sweeper.failed",
  HEARTBEAT_FAILED: "heartbeat.failed",
  // Database
  DB_POOL_ERROR: "db.pool_error",
});

export default ERROR_CODES;
