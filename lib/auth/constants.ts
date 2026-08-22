// Kept dependency-free (no "server-only", no Prisma) so middleware running
// on the Edge runtime can import it without pulling in Node-only code.
export const SESSION_COOKIE_NAME = "inkpaper_session";
