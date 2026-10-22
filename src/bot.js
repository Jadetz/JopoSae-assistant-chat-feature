import "dotenv/config";
import { startWhatsApp } from "./adapters/whatsApp/whatsAppClient.js";
import { sendText } from "./adapters/whatsApp/messageSender.js";
import { buildReply } from "./services/botService.js";
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

startWhatsApp({
  onMessage: handleIncomingMessage,
  pairingNumber: process.env.WA_BOT_NUMBER,
}).catch((error) => {
  console.error("[bot] failed to start:", error);
  process.exit(1);
});
