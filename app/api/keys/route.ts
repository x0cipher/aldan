import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createNewApiKey, listUserApiKeys, revokeApiKey } from "@/lib/api-key";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  const userId = session?.user?.id || "guest_user";

  const keys = await listUserApiKeys(userId);
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  const userId = session?.user?.id || "guest_user";

  const { name } = (await req.json().catch(() => ({}))) as { name?: string };

  const created = await createNewApiKey({
    userId,
    name: name || "Developer Key",
    expiresInDays: 90,
  });

  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  const userId = session?.user?.id || "guest_user";

  const { searchParams } = new URL(req.url);
  const keyId = searchParams.get("id");

  if (!keyId) {
    return NextResponse.json({ error: "Missing key ID" }, { status: 400 });
  }

  await revokeApiKey(keyId, userId);
  return NextResponse.json({ success: true });
}
