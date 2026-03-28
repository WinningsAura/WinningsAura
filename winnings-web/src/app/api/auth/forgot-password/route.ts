import { NextRequest, NextResponse } from "next/server";
import { hashToken, randomToken } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
import { readUsers, writeUsers } from "@/lib/users";

function getBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = (body.email || "").trim().toLowerCase();

    const users = readUsers();
    const idx = users.findIndex((u) => u.email === email);

    if (idx >= 0) {
      const token = randomToken();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
      users[idx] = {
        ...users[idx],
        resetTokenHash: hashToken(token),
        resetTokenExpiresAt: expiresAt,
        updatedAt: new Date().toISOString(),
      };
      writeUsers(users);

      const resetUrl = `${getBaseUrl(req)}/account/reset-password?token=${token}`;
      await sendEmail({
        to: email,
        subject: "Reset your WinningsAura password",
        text: `Use this link to reset your password (valid 30 minutes): ${resetUrl}`,
        html: `<p>Use this link to reset your password (valid 30 minutes):</p><p><a href=\"${resetUrl}\">${resetUrl}</a></p>`,
      });
    }

    return NextResponse.json({ ok: true, message: "If an account exists, a reset email has been sent." });
  } catch (e) {
    return NextResponse.json({ error: "Failed to process forgot password", detail: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}
