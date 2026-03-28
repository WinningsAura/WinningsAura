import { NextRequest, NextResponse } from "next/server";
import { getSessionEmailFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const email = getSessionEmailFromRequest(req);
  if (!email) return NextResponse.json({ authenticated: false });
  return NextResponse.json({ authenticated: true, email });
}
