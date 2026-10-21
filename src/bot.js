import "dotenv/config";
import { startWhatsApp } from "./adapters/whatsApp/whatsAppClient.js";
import { sendText } from "./adapters/whatsApp/messageSender.js";

const handleIncomingMessage = async (incoming, sock) => {
  console.log("[bot] incoming", incoming);
  if (incoming.messageType !== "text") {
    await sendText(
      sock,
      incoming.jid,
      "Mohon maaf, saat ini kami hanya dapat membaca pesan teks",
    );
    return;
  }

  await sendText(sock, incoming.jid, `Anda mengirim: ${incoming.text}`);
};

startWhatsApp({
  onMessage: handleIncomingMessage,
  pairingNumber: process.env.WA_BOT_NUMBER,
}).catch((error) => {
  console.error("[bot] failed to start:", error);
  process.exit(1);
});
