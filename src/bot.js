import "dotenv/config";
import { startWhatsApp } from "./adapters/whatsApp/whatsAppClient.js";
import { sendText } from "./adapters/whatsApp/messageSender.js";
import { buildReply } from "./services/botService.js";
import { findOrStartConversation } from "./services/conversationService.js";
import { sessionConfig } from "./config/sessionConfig.js";
import * as sweeper from "./services/sweeper.js";
import { trackConnection } from "./services/heartbeat.js";

const handleIncomingMessage = async (incoming, sock) => {
  console.log("[JopoSae Assistant Chat] incoming", incoming);
  let reply;
  try {
    // Every customer message counts as activity, text or not, so the session is decided first
    const session = await findOrStartConversation(incoming);
    if (incoming.messageType !== "text") {
      reply = "_Mohon maaf, saat ini kami hanya dapat membaca pesan teks_";
    } else {
      reply = await buildReply(incoming, session);
    }
  } catch (error) {
    console.error("[JopoSae Assistant Chat] failed to build reply", error);
    reply =
      "_Mohon maaf, sistem kami sedang mengalami gangguan. Silahkan coba beberapa saat lagi_";
  }

  await sendText(sock, incoming.jid, reply);
};

// Messages from one customer run one at a time, so two quick messages
// cannot both create a conversation or read the same state
const queues = new Map();
const handleInOrder = (incoming, sock) => {
  const key = incoming.phoneNumber ?? incoming.jid;
  const previous = queues.get(key) ?? Promise.resolve();
  const current = previous.then(() => handleIncomingMessage(incoming, sock));
  // A failed message must not block the next one
  const tail = current
    .catch(() => {})
    .then(() => {
      if (queues.get(key) === tail) {
        queues.delete(key);
      }
    });
  queues.set(key, tail);
  return current;
};

// The sweeper only runs while connected: offline, every customer would look quiet
const handleConnectionChange = async (connection) => {
  await trackConnection(connection);
  if (connection === "open") {
    sweeper.start();
  }
  if (connection === "close") {
    sweeper.stop();
  }
};

startWhatsApp({
  onMessage: handleInOrder,
  onConnectionChange: handleConnectionChange,
  pairingNumber: process.env.WA_BOT_NUMBER,
  // Offline messages older than this are skipped instead of answered (see whatsAppClient.js)
  offlineMaxAgeMinutes: sessionConfig.offlineMessageMaxAgeMinutes,
}).catch((error) => {
  console.error("[bot] failed to start:", error);
  process.exit(1);
});
