import {
  saveConnectionState,
  touchLastSeen,
} from "../repositories/botStatusRepository.js";
import logger from "../lib/logger.js";
import ERROR_CODES from "../lib/errorCodes.js";

const log = logger.child({ component: "heartbeat" });
const BEAT_INTERVAL = 60 * 1000;

// Only one heartbeat per process, however often the connection opens
let beatTimer = null;

// Errors are logged, never thrown: a missed heartbeat must not stop the bot
const beat = async () => {
  try {
    await touchLastSeen();
  } catch (error) {
    log.error(
      {
        err: error,
        code: ERROR_CODES.HEARTBEAT_FAILED,
      },
      "Failed to update last_seen_at.",
    );
  }
};

// Save every connection change; while open, refresh last_seen_at every minute
const trackConnection = async (connection) => {
  try {
    await saveConnectionState(connection);
  } catch (error) {
    log.error(
      {
        err: error,
        code: ERROR_CODES.HEARTBEAT_FAILED,
      },
      "Failed to save connection state.",
    );
  }

  if (connection === "open") {
    if (!beatTimer) {
      beatTimer = setInterval(beat, BEAT_INTERVAL);
    }
    return;
  }
  // Only open counts as online: a reconnecting bot cannot reply yet
  clearInterval(beatTimer);
  beatTimer = null;
};

export { trackConnection };
