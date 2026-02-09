import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  username: string;
  exp: number;
}

/**
 * Verify the session token and return session data
 * Call this at the beginning of protected API routes
 */
export async function verifySession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(sessionToken, "base64").toString(),
    ) as SessionData;

    // Check if token is expired
    if (decoded.exp < Date.now()) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Create a session token for a user
 */
export function createSessionToken(userId: string, username: string): string {
  return Buffer.from(
    JSON.stringify({
      userId,
      username,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours expiration
    }),
  ).toString("base64");
}
