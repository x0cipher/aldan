import { NextResponse } from "next/server";
import { getOpenApiDocumentation } from "@/lib/openapi/spec";

export const dynamic = "force-dynamic";

export async function GET() {
  const spec = getOpenApiDocumentation();
  return NextResponse.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
