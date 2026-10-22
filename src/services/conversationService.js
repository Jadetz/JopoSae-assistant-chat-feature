import { upsertContact } from "../repositories/contactRepository.js";
import {
  findActiveConversationByContactId,
  createConversation,
} from "../repositories/conversationRepository.js";

const contactNumberOf = (incoming) => {
  return incoming.phoneNumber ?? incoming.jid.split("@")[0];
};

// save the sender as a contact

const findOrStartConversation = async (incoming) => {
  const contact = await upsertContact(
    contactNumberOf(incoming),
    incoming.displayName,
  );

  const active = await findActiveConversationByContactId(contact.id);
  if (active) {
    return active;
  }
  return createConversation(contact.id);
};

export { findOrStartConversation };
