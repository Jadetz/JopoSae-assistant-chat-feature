import {
  saveConnectionState,
  touchLastSeen,
} from "../repositories/botStatusRepository.js";

const BEAT_INTERVAL = 60 * 1000;

// Only one heartbeat per process, however often the connection opens
let beatTimer = null;

// Errors are logged, never thrown: a missed heartbeat must not stop the bot
const beat = async () => {
  try {
    await touchLastSeen();
  } catch (error) {
    console.error("[heartbeat] failed to update last_seen_at:", error);
  }
};

// Save every connection change; while open, refresh last_seen_at every minute
const trackConnection = async (connection) => {
  try {
    await saveConnectionState(connection);
  } catch (error) {
    console.error("[heartbeat] failed to save connection state:", error);
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
