// Which Google accounts may sign in (KEPUTUSAN entry 16).
// Workspace: the token's hd claim equals ALLOWED_GOOGLE_DOMAIN.
// Gmail backup: no hd and an @gmail.com address, only when ALLOW_GMAIL_ACCOUNTS is "true".
// With neither key set, every domain passes (local development).
const GMAIL_SUFFIX = "@gmail.com";

const isAllowedGoogleAccount = (hd, email) => {
  const allowedDomain = process.env.ALLOWED_GOOGLE_DOMAIN?.trim() ?? "";
  const allowGmail = process.env.ALLOW_GMAIL_ACCOUNTS?.trim() === "true";
  if (allowedDomain === "" && !allowGmail) {
    return true;
  }
  if (allowedDomain !== "" && hd === allowedDomain) {
    return true;
  }
  return allowGmail && !hd && email.endsWith(GMAIL_SUFFIX);
};

export { isAllowedGoogleAccount };
