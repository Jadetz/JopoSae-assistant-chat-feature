import { OAuth2Client } from "google-auth-library";
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim();

// Without an audience, verifyIdToken accepts ID tokens issued to ANY Google app,
// so a token from another site would sign in here. Refuse to start instead.
if (!CLIENT_ID) {
  throw new Error(
    "GOOGLE_CLIENT_ID is empty. Set it in .env before starting the API.",
  );
}

const client = new OAuth2Client();

// Returns the token's claims when it was issued to this app, or null otherwise.
// The error is not logged; its message can echo parts of the token.
const verifyGoogleIdToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
    return ticket.getPayload();
  } catch {
    return null;
  }
};

export { verifyGoogleIdToken };
