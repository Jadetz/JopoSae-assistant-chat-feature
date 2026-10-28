import "dotenv/config";
import { startWhatsApp } from "./adapters/whatsApp/whatsAppClient.js";
import { sendText } from "./adapters/whatsApp/messageSender.js";
import { buildReply } from "./services/botService.js";
// Reads and checks the session settings from .env on import, so dotenv must be imported first.
// A wrong value stops the bot right here with a clear message.
import { sessionConfig } from "./config/sessionConfig.js";

const handleIncomingMessage = async (incoming, sock) => {
  console.log("[JopoSae Assistant Chat] incoming", incoming);
  if (incoming.messageType !== "text") {
    await sendText(
      sock,
      incoming.jid,
      "Mohon maaf, saat ini kami hanya dapat membaca pesan teks",
    );
    return;
  }
  let reply;
  try {
    reply = await buildReply(incoming);
  } catch (error) {
    console.error("[JopoSae Assistant Chat] failed to build reply", error);
    reply =
      "Mohon maaf, sistem kami sedang mengalami gangguan. Silahkan coba beberapa saat lagi";
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

startWhatsApp({
  onMessage: handleInOrder,
  pairingNumber: process.env.WA_BOT_NUMBER,
  // Offline messages older than this are skipped instead of answered (see whatsAppClient.js)
  offlineMaxAgeMinutes: sessionConfig.offlineMessageMaxAgeMinutes,
}).catch((error) => {
  console.error("[bot] failed to start:", error);
  process.exit(1);
});
