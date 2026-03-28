import { NextRequest, NextResponse } from "next/server";
import { getSessionEmailFromRequest, hashPassword, verifyPassword } from "@/lib/auth";
import { readUsers, writeUsers } from "@/lib/users";

export async function POST(req: NextRequest) {
  try {
    const email = getSessionEmailFromRequest(req);
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as { currentPassword?: string; newPassword?: string };
    const currentPassword = body.currentPassword || "";
    const newPassword = body.newPassword || "";

    if (newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });

    const users = readUsers();
    const idx = users.findIndex((u) => u.email === email);
    if (idx < 0) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (!verifyPassword(currentPassword, users[idx].passwordHash)) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    users[idx] = { ...users[idx], passwordHash: hashPassword(newPassword), updatedAt: new Date().toISOString() };
    writeUsers(users);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to change password", detail: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}
