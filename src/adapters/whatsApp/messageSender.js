const sendText = async (sock, jid, text) => {
  if (typeof text !== "string" || text.trim() === "") {
    throw new Error("sendText: text must be a non-empty string");
  }

  const sentMessage = await sock.sendMessage(jid, { text });

  return sentMessage?.key?.id ?? null;
};

export { sendText };
