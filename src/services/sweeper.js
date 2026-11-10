import { sessionConfig } from "../config/sessionConfig.js";
import { closeIdleConversations } from "../repositories/conversationRepository.js";
import logger from "../lib/logger.js";
import ERROR_CODES from "../lib/errorCodes.js";
const MINUTE = 60 * 1000;
const log = logger.child({
  component: "sweeper",
});
// Only one sweeper per process, however often the connection opens
let startTimer = null; // initial delay
let sweepTimer = null; // repeats every sweeperIntervalMinutes

// One round: close every conversation whose customer went quiet. Errors are logged, never thrown.
const sweep = async () => {
  try {
    const closed = await closeIdleConversations(
      sessionConfig.idleTimeoutMinutes,
    );
    log.info(
      {
        closed: closed.length,
      },
      "Sweep finished",
    );
  } catch (error) {
    log.error(
      {
        err: error,
        code: ERROR_CODES.SWEEPER_FAILED,
      },
      "Sweep failed",
    );
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
