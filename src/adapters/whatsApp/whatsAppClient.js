import makeWASocket, {
  DisconnectReason,
  fetchLatestWaWebVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import { parseIncomingMessage } from "./messageParser.js";

const AUTH_FOLDER = "auth_info";

// Connect to WhatsApp and pass every valid incoming message to onMessage(incoming, sock)
// pairingNumber: bot number, digits only with country code, e.g. "6281234567890"
const startWhatsApp = async ({ onMessage, pairingNumber }) => {
  // Session is stored in AUTH_FOLDER so the QR only needs to be scanned once
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  // requestPairingCode saves creds.me before pairing ends, account only exists after pair-success.
  // With me but no account Baileys tries to log in and WhatsApp rejects it as logged out.
  if (state.creds?.me && !state.creds.account) {
    console.log("[whatsapp] previous pairing did not finish, starting a new one");
    state.creds.me = undefined;
  }
  // Baileys' bundled WA Web version can be outdated and get rejected at pairing
  const { version } = await fetchLatestWaWebVersion();
  console.log(`[whatsapp] using WA Web version ${version.join(".")}`);
  const sock = makeWASocket({ auth: state, version });

  // qr repeats every ~20s, a new pairing code each time would invalidate the one being typed
  let pairingCodeRequested = false;

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    // qr means the socket is ready but not logged in
    if (qr) {
      // QR login is broken in Baileys rc14 (companion_reg_refresh), pairing code avoids it
      if (!pairingNumber) {
        qrcode.generate(qr, { small: true });
      } else if (!pairingCodeRequested) {
        pairingCodeRequested = true;
        try {
          const code = await sock.requestPairingCode(pairingNumber);
          console.log(`[whatsapp] pairing code: ${code}`);
        } catch (error) {
          console.error("[whatsapp] pairing code request failed:", error);
        }
      }
    }

    if (connection === "open") {
      console.log("[whatsapp] connected");
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;

      // Logged out from the phone: reconnecting would loop forever
      if (statusCode === DisconnectReason.loggedOut) {
        console.log("[whatsapp] logged out, delete auth_info/ and scan again");
        return;
      }

      console.log(`[whatsapp] connection closed (${statusCode}), reconnecting`);
      startWhatsApp({ onMessage, pairingNumber }).catch((error) => {
        console.error("[whatsapp] reconnect failed:", error);
      });
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    // "append" = history sync, only "notify" is a new message
    if (type !== "notify") {
      return;
    }

    for (const waMessage of messages) {
      const incoming = parseIncomingMessage(waMessage);
      if (!incoming) {
        continue;
      }

      // One failing message must not stop the others
      try {
        await onMessage(incoming, sock);
      } catch (error) {
        console.error("[whatsapp] message handler failed:", error);
      }
    }
  });

  return sock;
};

export { startWhatsApp };
