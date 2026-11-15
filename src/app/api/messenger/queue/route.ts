import { NextRequest, NextResponse } from "next/server";
import { approveDraft, listDrafts } from "@/lib/messenger";

export const dynamic = "force-dynamic";

function authed(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  return NextResponse.json({ drafts: await listDrafts() });
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const result = await approveDraft(id);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
