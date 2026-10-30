import { upsertContact } from "../repositories/contactRepository.js";
import {
  claimActiveConversation,
  closeStaleConversation,
  createConversation,
  findLastClosedConversation,
  createResumedConversation,
} from "../repositories/conversationRepository.js";
import { withTransaction } from "../db.js";
import { sessionConfig } from "../config/sessionConfig.js";

const UNIQUE_VIOLATION = "23505";

const contactNumberOf = (incoming) => {
  return incoming.phoneNumber ?? incoming.jid.split("@")[0];
};

// No ended_at means we cannot tell when it ended, so it counts as outside the window
const isWithinResumeWindow = (endedAt, sentAt) =>
  endedAt !== null &&
  sentAt.getTime() - endedAt.getTime() <
    sessionConfig.resumeWindowMinutes * 60 * 1000;

// Close the stale conversation and open a new one together, or not at all.
// A customer who comes back soon continues on the same screen.
const startConversation = (contactId, sentAt) => {
  return withTransaction(async (client) => {
    await closeStaleConversation(
      contactId,
      sentAt,
      sessionConfig.idleTimeoutMinutes,
      client,
    );
    // Uses the client, so it also sees the conversation closed just above
    const previous = await findLastClosedConversation(contactId, client);
    if (!previous) {
      return {
        conversation: await createConversation(contactId, sentAt, client),
        origin: "new",
      };
    }
    if (isWithinResumeWindow(previous.ended_at, sentAt)) {
      const conversation = await createResumedConversation(
        contactId,
        sentAt,
        previous,
        client,
      );
      return { conversation, origin: "resumed" };
    }
    // Too long ago: the old screen is not trusted, start from the main menu
    return {
      conversation: await createConversation(contactId, sentAt, client),
      origin: "returning",
    };
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
