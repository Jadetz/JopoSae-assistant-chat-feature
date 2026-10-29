import { sessionConfig } from "../config/sessionConfig.js";
import { closeIdleConversations } from "../repositories/conversationRepository.js";

const MINUTE = 60 * 1000;

// Only one sweeper per process, however often the connection opens
let startTimer = null; // jeda awal
let sweepTimer = null; // sweeper jalan 5 menit sekali

// One round: close every conversation whose customer went quiet. Errors are logged, never thrown.
const sweep = async () => {
  try {
    const closed = await closeIdleConversations(
      sessionConfig.idleTimeoutMinutes,
    );
    console.log(`[sweeper] closed ${closed.length} conversation(s)`);
  } catch (error) {
    console.error("[sweeper] sweep failed:", error);
  }
};

// Wait first, so messages sent while the bot was offline are processed before anything is closed
const start = () => {
  if (startTimer || sweepTimer) {
    return;
  }
  startTimer = setTimeout(() => {
    startTimer = null;
    sweep();
    sweepTimer = setInterval(
      sweep,
      sessionConfig.sweeperIntervalMinutes * MINUTE,
    );
  }, sessionConfig.sweeperStartDelayMinutes * MINUTE);
};

const stop = () => {
  clearTimeout(startTimer);
  clearInterval(sweepTimer);
  startTimer = null;
  sweepTimer = null;
};

export { start, stop };
