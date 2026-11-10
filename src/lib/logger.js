import pino from "pino";

// Keys that may carry customer data or secrets.
// Redaction is a safety net only: never pass incoming messages,
// req.body, or whole contact rows to the logger. Log IDs instead.

const SENSITIVE_KEYS = [
  "phoneNumber",
  "jid",
  "text",
  "body",
  "password",
  "token",
  "apiKey",
  "authorization",
];

// Top level, one level deep, plus pg error detail
// (unique violations echo column values)

const REDACT_PATHS = [
  ...SENSITIVE_KEYS,
  ...SENSITIVE_KEYS.map((key) => `*.${key}`),
  "err.detail",
];

// Shared logger for the API and bot: one JSON line per entry on stdout.
// LOG_SOURCE comes from npm scripts (cross-env): "unknown" means a script forgot it

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: {
    source: process.env.LOG_SOURCE || "unknown",
    pid: process.pid,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: REDACT_PATHS,
});

export default logger;
