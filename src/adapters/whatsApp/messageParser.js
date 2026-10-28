import {
  getContentType,
  isJidGroup,
  isJidStatusBroadcast,
  isLidUser,
  jidNormalizedUser,
  normalizeMessageContent,
  toNumber,
  isJidNewsletter,
} from "@whiskeysockets/baileys";

const sentAtOf = (waMessage) => {
  const seconds = toNumber(waMessage.messageTimestamp);
  if (!seconds) {
    console.warn(
      `[parser] message ${waMessage.key.id} has no timestamp, using current time`,
    );
    return new Date();
  }
  return new Date(seconds * 1000);
};
// Reactions, edits, deletions and poll votes are not new messages from the customer
const IGNORED_CONTENT_TYPES = [
  "reactionMessage",
  "encReactionMessage",
  "protocolMessage",
  "pollUpdateMessage",
  "keepInChatMessage",
  "pinInChatMessage",
];

const parseIncomingMessage = (waMessage) => {
  const { key, message, pushName } = waMessage;
  // debugg message and fromMe
  //   console.log("Message is", typeof message);
  //   console.log("isFromMe", typeof key.fromMe);
  // bot tidak boleh membalas pesannya sendiri
  if (!message || key.fromMe === true) {
    return null;
  }

  const jid = key.remoteJid;
  // if jid is none or from group or status validate
  if (
    !jid ||
    isJidGroup(jid) ||
    isJidStatusBroadcast(jid) ||
    isJidNewsletter(jid)
  ) {
    return null;
  }
  // normalize and ge content
  const content = normalizeMessageContent(message); // normalisasi isi konten dengan helper baileys
  const contentType = getContentType(content); // return nama konten dari properti utama
  if (!contentType || IGNORED_CONTENT_TYPES.includes(contentType)) {
    return null;
  }
  const text =
    content?.conversation ?? content?.extendedTextMessage?.text ?? null;
  const phoneId = isLidUser(jid) ? key.remoteJidAlt : jid;
  const phoneNumber = phoneId ? jidNormalizedUser(phoneId).split("@")[0] : null;
  // messageType
  let messageType =
    text !== null
      ? "text"
      : contentType === "imageMessage"
        ? "image"
        : "unknown";

  return {
    jid,
    phoneNumber,
    displayName: pushName ?? null,
    text,
    messageType,
    providerMessageId: key.id,
    sentAt: sentAtOf(waMessage),
  };
};

export { parseIncomingMessage };
