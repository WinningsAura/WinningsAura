import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, sessionCookieHeader, verifyPassword } from "@/lib/auth";
import { readUsers } from "@/lib/users";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    const user = readUsers().find((u) => u.email === email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = createSessionToken(email);
    const res = NextResponse.json({ ok: true });
    res.headers.append("Set-Cookie", sessionCookieHeader(token));
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Login failed", detail: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}
