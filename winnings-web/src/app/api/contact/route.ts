import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  website?: string; // honeypot (must stay empty)
};

type Submission = {
  name: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: string;
};

const headers = ["Name", "Email", "Phone", "Message", "Submitted At"];

function getCsvPath() {
  // On Vercel serverless, the deployment filesystem is read-only.
  // /tmp is writable during the function's lifetime.
  if (process.env.VERCEL) {
    return path.join("/tmp", "contact-submissions.csv");
  }

  // Local/dev fallback.
  return path.resolve(process.cwd(), "..", "contact-submissions.csv");
}

const csvPath = getCsvPath();
const rateLimitWindowMs = 60_000;
const maxRequestsPerWindow = 5;
const ipWindow = new Map<string, number[]>();

function isAuthorizedAdmin(req: NextRequest) {
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;

  if (!adminUser || !adminPass) return false;

  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Basic ")) return false;

  try {
    const base64 = authHeader.slice(6).trim();
    const decoded = Buffer.from(base64, "base64").toString("utf8");
    const [user, ...rest] = decoded.split(":");
    const pass = rest.join(":");
    return user === adminUser && pass === adminPass;
  } catch {
    return false;
  }
}

function toCsvCell(value: string) {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function validateEmail(email: string) {
  // stricter but practical email format check
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

function applyRateLimit(ip: string) {
  const now = Date.now();
  const existing = ipWindow.get(ip) ?? [];
  const recent = existing.filter((t) => now - t <= rateLimitWindowMs);

  if (recent.length >= maxRequestsPerWindow) return false;

  recent.push(now);
  ipWindow.set(ip, recent);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ContactPayload;

    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.phone || "").trim();
    const message = (body.message || "").trim();
    const website = (body.website || "").trim();

    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (!applyRateLimit(ip)) {
      return NextResponse.json({ error: "Too many submissions. Please wait a minute and try again." }, { status: 429 });
    }

    if (website) {
      return NextResponse.json({ error: "Spam check failed." }, { status: 400 });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, Email, and Message are required." }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (message.length < 10) {
      return NextResponse.json({ error: "Message is too short. Please provide more details." }, { status: 400 });
    }

    const submittedAt = new Date().toISOString();

    if (!fs.existsSync(csvPath)) {
      fs.writeFileSync(csvPath, `${headers.map(toCsvCell).join(",")}\n`, "utf8");
    }

    const row = [name, email, phone, message, submittedAt].map(toCsvCell).join(",") + "\n";
    fs.appendFileSync(csvPath, row, "utf8");

    return NextResponse.json({ ok: true, storage: "contact-submissions.csv" });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to save contact submission", detail: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="WinningsAura Admin"' },
    });
  }

  try {
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ submissions: [] });
    }

    const csvText = fs.readFileSync(csvPath, "utf8");
    const rows = parseCsv(csvText);
    if (rows.length <= 1) return NextResponse.json({ submissions: [] });

    const dataRows = rows.slice(1);
    const submissions: Submission[] = dataRows
      .map((r) => ({
        name: r[0] || "",
        email: r[1] || "",
        phone: r[2] || "",
        message: r[3] || "",
        submittedAt: r[4] || "",
      }))
      .reverse();

    return NextResponse.json({ submissions });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to read submissions", detail: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}
