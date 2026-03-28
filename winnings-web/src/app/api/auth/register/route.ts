import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, hashPassword, sessionCookieHeader } from "@/lib/auth";
import { readUsers, writeUsers } from "@/lib/users";

function validEmail(email: string) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!validEmail(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const users = readUsers();
    if (users.some((u) => u.email === email)) {
      return NextResponse.json({ error: "Account already exists for this email." }, { status: 409 });
    }

    const now = new Date().toISOString();
    users.push({
      email,
      passwordHash: hashPassword(password),
      createdAt: now,
      updatedAt: now,
      resetTokenHash: "",
      resetTokenExpiresAt: "",
    });
    writeUsers(users);

    const token = createSessionToken(email);
    const res = NextResponse.json({ ok: true });
    res.headers.append("Set-Cookie", sessionCookieHeader(token));
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Registration failed", detail: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}
