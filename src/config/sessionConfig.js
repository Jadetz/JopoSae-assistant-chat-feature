// Session settings from .env, checked once when the bot starts

// A setting that is missing, not a number, zero or negative stops the bot with a clear message
const readPositiveInteger = (name) => {
  const raw = process.env[name];
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer, got "${raw}"`);
  }
  return value;
};

const sessionConfig = {
  idleTimeoutMinutes: readPositiveInteger("CONVERSATION_IDLE_TIMEOUT_MINUTES"),
  resumeWindowMinutes: readPositiveInteger(
    "CONVERSATION_RESUME_WINDOW_MINUTES",
  ),
  sweeperIntervalMinutes: readPositiveInteger("SWEEPER_INTERVAL_MINUTES"),
  sweeperStartDelayMinutes: readPositiveInteger("SWEEPER_START_DELAY_MINUTES"),
  offlineMessageMaxAgeMinutes: readPositiveInteger(
    "OFFLINE_MESSAGE_MAX_AGE_MINUTES",
  ),
};

export { sessionConfig };
