import crypto from "node:crypto";
import { db } from "@/db";
import { apiKey, user } from "@/db/schema/auth";
import { eq, and } from "drizzle-orm";

export function generateApiKey(prefix = "aldan_sk_") {
  const randomBytes = crypto.randomBytes(24).toString("base64url");
  return `${prefix}${randomBytes}`;
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function createNewApiKey(params: {
  userId: string;
  name?: string;
  expiresInDays?: number;
}) {
  const rawKey = generateApiKey();
  const hashedKey = hashApiKey(rawKey);
  const start = rawKey.slice(0, 14); // e.g. aldan_sk_ab12
  const id = `key_${crypto.randomUUID()}`;

  const expiresAt = params.expiresInDays
    ? new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  await db.insert(apiKey).values({
    id,
    userId: params.userId,
    name: params.name || "Default API Key",
    key: hashedKey,
    start,
    prefix: "aldan_sk_",
    enabled: true,
    expiresAt,
  });

  return {
    id,
    name: params.name || "Default API Key",
    apiKey: rawKey,
    start,
    expiresAt,
  };
}

export async function validateApiKey(rawKey: string) {
  if (!rawKey.startsWith("aldan_sk_")) {
    return null;
  }

  const hashedKey = hashApiKey(rawKey);

  const [foundKey] = await db
    .select({
      keyId: apiKey.id,
      userId: apiKey.userId,
      enabled: apiKey.enabled,
      expiresAt: apiKey.expiresAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(apiKey)
    .innerJoin(user, eq(apiKey.userId, user.id))
    .where(and(eq(apiKey.key, hashedKey), eq(apiKey.enabled, true)))
    .limit(1);

  if (!foundKey) {
    return null;
  }

  if (foundKey.expiresAt && foundKey.expiresAt < new Date()) {
    return null;
  }

  // Update request count and last request timestamp asynchronously
  db.update(apiKey)
    .set({
      lastRequest: new Date(),
    })
    .where(eq(apiKey.id, foundKey.keyId))
    .catch(() => {});

  return {
    userId: foundKey.userId,
    user: foundKey.user,
    keyId: foundKey.keyId,
  };
}

export async function revokeApiKey(keyId: string, userId: string) {
  return db
    .update(apiKey)
    .set({ enabled: false })
    .where(and(eq(apiKey.id, keyId), eq(apiKey.userId, userId)));
}

export async function listUserApiKeys(userId: string) {
  return db
    .select({
      id: apiKey.id,
      name: apiKey.name,
      start: apiKey.start,
      enabled: apiKey.enabled,
      createdAt: apiKey.createdAt,
      lastRequest: apiKey.lastRequest,
      expiresAt: apiKey.expiresAt,
    })
    .from(apiKey)
    .where(eq(apiKey.userId, userId));
}
