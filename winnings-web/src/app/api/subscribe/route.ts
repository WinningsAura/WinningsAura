import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

type SubscribePayload = {
  email?: string;
  company?: string; // honeypot
};

const headers = ["Email", "Source", "Subscribed At"];
const rateLimitWindowMs = 60_000;
const maxRequestsPerWindow = 8;
const ipWindow = new Map<string, number[]>();

function getCsvPath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "subscriptions.csv");
  }

  return path.resolve(process.cwd(), "..", "subscriptions.csv");
}

const csvPath = getCsvPath();

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
    const body = (await req.json()) as SubscribePayload;

    const email = (body.email || "").trim().toLowerCase();
    const company = (body.company || "").trim();
    const source = "website-footer";

    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (!applyRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please wait a minute and try again." }, { status: 429 });
    }

    if (company) {
      return NextResponse.json({ error: "Spam check failed." }, { status: 400 });
    }

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!fs.existsSync(csvPath)) {
      fs.writeFileSync(csvPath, `${headers.map(toCsvCell).join(",")}\n`, "utf8");
    }

    const csvText = fs.readFileSync(csvPath, "utf8");
    const rows = parseCsv(csvText);
    const existingEmails = new Set(rows.slice(1).map((r) => (r[0] || "").trim().toLowerCase()));

    if (existingEmails.has(email)) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }

    const subscribedAt = new Date().toISOString();
    const row = [email, source, subscribedAt].map(toCsvCell).join(",") + "\n";
    fs.appendFileSync(csvPath, row, "utf8");

    return NextResponse.json({ ok: true, alreadySubscribed: false, storage: "subscriptions.csv" });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to subscribe", detail: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}
