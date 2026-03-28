import { NextRequest, NextResponse } from "next/server";
import { hashPassword, hashToken } from "@/lib/auth";
import { readUsers, writeUsers } from "@/lib/users";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { token?: string; newPassword?: string };
    const token = (body.token || "").trim();
    const newPassword = body.newPassword || "";

    if (!token) return NextResponse.json({ error: "Reset token is required." }, { status: 400 });
    if (newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });

    const tokenHash = hashToken(token);
    const users = readUsers();
    const idx = users.findIndex(
      (u) => u.resetTokenHash === tokenHash && u.resetTokenExpiresAt && new Date(u.resetTokenExpiresAt).getTime() > Date.now()
    );

    if (idx < 0) return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });

    users[idx] = {
      ...users[idx],
      passwordHash: hashPassword(newPassword),
      updatedAt: new Date().toISOString(),
      resetTokenHash: "",
      resetTokenExpiresAt: "",
    };
    writeUsers(users);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to reset password", detail: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}
