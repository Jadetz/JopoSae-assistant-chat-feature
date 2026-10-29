import makeWASocket, {
  DisconnectReason,
  fetchLatestWaWebVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import { parseIncomingMessage } from "./messageParser.js";

const AUTH_FOLDER = "auth_info";

// True when the message is older than maxAgeMinutes.
// Both sides are milliseconds: now minus sentAt (from the parser) vs the limit in minutes * 60 * 1000.
const isTooOld = (sentAt, maxAgeMinutes) =>
  Date.now() - sentAt.getTime() > maxAgeMinutes * 60 * 1000;

// Connect to WhatsApp and pass every valid incoming message to onMessage(incoming, sock)
// pairingNumber: bot number, digits only with country code, e.g. "6281234567890"
// offlineMaxAgeMinutes: messages sent while the bot was offline and older than this are skipped
// onConnectionChange(connection): called with "connecting", "open" or "close"
const startWhatsApp = async ({
  onMessage,
  onConnectionChange,
  pairingNumber,
  offlineMaxAgeMinutes,
}) => {
  // Session is stored in AUTH_FOLDER so the QR only needs to be scanned once
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  // requestPairingCode saves creds.me before pairing ends, account only exists after pair-success.
  // With me but no account Baileys tries to log in and WhatsApp rejects it as logged out.
  if (state.creds?.me && !state.creds.account) {
    console.log(
      "[whatsapp] previous pairing did not finish, starting a new one",
    );
    state.creds.me = undefined;
  }
  // Baileys' bundled WA Web version can be outdated and get rejected at pairing
  const { version } = await fetchLatestWaWebVersion();
  console.log(`[whatsapp] using WA Web version ${version.join(".")}`);
  const sock = makeWASocket({ auth: state, version });

  // qr repeats every ~20s, a new pairing code each time would invalidate the one being typed
  let pairingCodeRequested = false;

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on(
    "connection.update",
    async ({ connection, lastDisconnect, qr }) => {
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

      // The bot decides what a connection change means (sweeper, heartbeat); a qr-only update has no connection
      if (connection && onConnectionChange) {
        try {
          await onConnectionChange(connection);
        } catch (error) {
          console.error("[whatsapp] connection handler failed:", error);
        }
      }

      if (connection === "open") {
        console.log("[whatsapp] connected");
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;

        // Logged out from the phone: reconnecting would loop forever
        if (statusCode === DisconnectReason.loggedOut) {
          console.log(
            "[whatsapp] logged out, delete auth_info/ and scan again",
          );
          return;
        }

        console.log(
          `[whatsapp] connection closed (${statusCode}), reconnecting`,
        );
        // A reconnect starts from scratch: every option must be passed again,
        // otherwise the new socket loses it (e.g. no age limit for offline messages)
        startWhatsApp({
          onMessage,
          onConnectionChange,
          pairingNumber,
          offlineMaxAgeMinutes,
        }).catch((error) => {
          console.error("[whatsapp] reconnect failed:", error);
        });
      }
    },
  );

  // "notify" = new message while the bot is online.
  // "append" = messages sent while the bot was offline, and the echo of the bot's own replies.
  // There is no type filter: the parser already drops own messages (fromMe), groups,
  // status, newsletters and reactions, so the echo never gets a reply.
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    for (const waMessage of messages) {
      const incoming = parseIncomingMessage(waMessage);
      if (!incoming) {
        continue;
      }

      // Answering a days-old message with the menu only confuses the customer.
      // Only "append" is checked: a "notify" customer is waiting right now, even if their clock is off.
      if (
        type === "append" &&
        isTooOld(incoming.sentAt, offlineMaxAgeMinutes)
      ) {
        console.log(
          `[whatsapp] skipped offline message ${incoming.providerMessageId} sent at ${incoming.sentAt.toISOString()}`,
        );
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
