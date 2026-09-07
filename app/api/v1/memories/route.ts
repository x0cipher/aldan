import { type NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { db } from "@/db";
import { userMemories } from "@/db/schema";
import { CreateMemoryRequestSchema } from "@/lib/openapi/registry";
import { eq, and, desc } from "drizzle-orm";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authContext = await authenticateApiRequest(req);
  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memories = await db
    .select({
      id: userMemories.id,
      userId: userMemories.userId,
      category: userMemories.category,
      content: userMemories.content,
      confidence: userMemories.confidence,
      createdAt: userMemories.createdAt,
    })
    .from(userMemories)
    .where(
      and(
        eq(userMemories.userId, authContext.userId),
        eq(userMemories.isArchived, false)
      )
    )
    .orderBy(desc(userMemories.createdAt));

  return NextResponse.json({
    object: "list",
    data: memories,
  });
}

export async function POST(req: NextRequest) {
  const authContext = await authenticateApiRequest(req);
  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreateMemoryRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 400 }
    );
  }

  const id = `mem_${crypto.randomUUID()}`;
  const now = new Date();

  await db.insert(userMemories).values({
    id,
    userId: authContext.userId,
    category: parsed.data.category,
    content: parsed.data.content,
    confidence: parsed.data.confidence,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json(
    {
      id,
      userId: authContext.userId,
      category: parsed.data.category,
      content: parsed.data.content,
      confidence: parsed.data.confidence,
      createdAt: now,
    },
    { status: 201 }
  );
}

export async function DELETE(req: NextRequest) {
  const authContext = await authenticateApiRequest(req);
  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const memoryId = searchParams.get("id");

  if (!memoryId) {
    return NextResponse.json(
      { error: "Missing required query parameter: id" },
      { status: 400 }
    );
  }

  await db
    .update(userMemories)
    .set({ isArchived: true, updatedAt: new Date() })
    .where(
      and(
        eq(userMemories.id, memoryId),
        eq(userMemories.userId, authContext.userId)
      )
    );

  return NextResponse.json({ success: true });
}
