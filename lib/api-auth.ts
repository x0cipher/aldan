import { type NextRequest } from "next/server";
import { validateApiKey } from "./api-key";
import { auth } from "./auth";

export interface AuthenticatedUser {
  userId: string;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  authType: "api_key" | "session";
}

export async function authenticateApiRequest(
  req: NextRequest
): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get("authorization");

  // 1. Check Bearer API Key
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const rawKey = authHeader.slice(7).trim();
    const apiKeyResult = await validateApiKey(rawKey);
    if (apiKeyResult) {
      return {
        userId: apiKeyResult.userId,
        user: apiKeyResult.user,
        authType: "api_key",
      };
    }
  }

  // 2. Check Better-Auth Session Cookie
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    if (session && session.user) {
      return {
        userId: session.user.id,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
        authType: "session",
      };
    }
  } catch {
    // Session retrieval failure
  }

  return null;
}
