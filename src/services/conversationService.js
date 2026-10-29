import { upsertContact } from "../repositories/contactRepository.js";
import {
  claimActiveConversation,
  closeStaleConversation,
  createConversation,
} from "../repositories/conversationRepository.js";
import { withTransaction } from "../db.js";
import { sessionConfig } from "../config/sessionConfig.js";
const UNIQUE_VIOLATION = "23505";
const contactNumberOf = (incoming) => {
  return incoming.phoneNumber ?? incoming.jid.split("@")[0];
};
// Close the stale conversation and open a new one together, or not at all
const startConversation = (contactId, sentAt) => {
  return withTransaction(async (client) => {
    await closeStaleConversation(
      contactId,
      sentAt,
      sessionConfig.idleTimeoutMinutes,
      client,
    );
    const conversation = await createConversation(contactId, sentAt, client);
    return { conversation, origin: "new" };
  });
};

const continueOrStart = async (contactId, sentAt) => {
  const conversation = await claimActiveConversation(
    contactId,
    sentAt,
    sessionConfig.idleTimeoutMinutes,
  );
  if (conversation) {
    return { conversation, origin: "continued" };
  }
  return startConversation(contactId, sentAt);
};
const findOrStartConversation = async (incoming) => {
  const contact = await upsertContact(
    contactNumberOf(incoming),
    incoming.displayName,
  );
  try {
    return await continueOrStart(contact.id, incoming.sentAt);
  } catch (error) {
    if (error.code !== UNIQUE_VIOLATION) {
      throw error;
    }
    return continueOrStart(contact.id, incoming.sentAt);
  }
};

export { findOrStartConversation };
