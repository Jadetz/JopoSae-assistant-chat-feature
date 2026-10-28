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

// messageTimestamp is in seconds and can be a number or a Long object, toNumber handles both
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
  // No content, or sent by the bot itself: never reply to our own messages
  if (!message || key.fromMe === true) {
    return null;
  }

  const jid = key.remoteJid;
  // Only private chats: skip groups, status updates and channels
  if (
    !jid ||
    isJidGroup(jid) ||
    isJidStatusBroadcast(jid) ||
    isJidNewsletter(jid)
  ) {
    return null;
  }
  // Unwrap ephemeral/view-once wrappers, then read the main content key (e.g. "conversation")
  const content = normalizeMessageContent(message);
  const contentType = getContentType(content);
  if (!contentType || IGNORED_CONTENT_TYPES.includes(contentType)) {
    return null;
  }
  const text =
    content?.conversation ?? content?.extendedTextMessage?.text ?? null;
  const phoneId = isLidUser(jid) ? key.remoteJidAlt : jid;
  const phoneNumber = phoneId ? jidNormalizedUser(phoneId).split("@")[0] : null;
  const messageType =
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
