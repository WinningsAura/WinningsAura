import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

type PrizePayload = {
  sport?: string;
  event?: string;
  category?: string;
  position?: string;
  prizeAmount?: string;
  currency?: string;
  prizeStructure?: string;
  submitterName?: string;
  submitterEmail?: string;
  notes?: string;
  website?: string; // honeypot
};

type Submission = {
  id: string;
  sport: string;
  event: string;
  category: string;
  position: string;
  prizeAmount: string;
  currency: string;
  prizeStructure: string;
  submitterName: string;
  submitterEmail: string;
  notes: string;
  status: "Pending" | "Approved" | "Rejected";
  adminComment: string;
  submittedAt: string;
  reviewedAt: string;
};

const headers = [
  "Id",
  "Sport",
  "Event",
  "Category",
  "Position",
  "Prize Amount",
  "Currency",
  "Prize Structure",
  "Submitter Name",
  "Submitter Email",
  "Notes",
  "Status",
  "Admin Comment",
  "Submitted At",
  "Reviewed At",
];

function getCsvPath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "prize-submissions.csv");
  }
  return path.resolve(process.cwd(), "..", "prize-submissions.csv");
}

const csvPath = getCsvPath();

function toCsvCell(value: string) {
  return `"${(value || "").replace(/"/g, '""')}"`;
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

function toSubmission(row: string[]): Submission {
  return {
    id: row[0] || "",
    sport: row[1] || "",
    event: row[2] || "",
    category: row[3] || "",
    position: row[4] || "",
    prizeAmount: row[5] || "",
    currency: row[6] || "",
    prizeStructure: row[7] || "",
    submitterName: row[8] || "",
    submitterEmail: row[9] || "",
    notes: row[10] || "",
    status: ((row[11] || "Pending") as Submission["status"]),
    adminComment: row[12] || "",
    submittedAt: row[13] || "",
    reviewedAt: row[14] || "",
  };
}

function fromSubmission(s: Submission) {
  return [
    s.id,
    s.sport,
    s.event,
    s.category,
    s.position,
    s.prizeAmount,
    s.currency,
    s.prizeStructure,
    s.submitterName,
    s.submitterEmail,
    s.notes,
    s.status,
    s.adminComment,
    s.submittedAt,
    s.reviewedAt,
  ];
}

function readAll(): Submission[] {
  if (!fs.existsSync(csvPath)) return [];
  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  if (rows.length <= 1) return [];
  return rows.slice(1).map(toSubmission);
}

function writeAll(list: Submission[]) {
  const head = `${headers.map(toCsvCell).join(",")}\n`;
  const body = list.map((s) => `${fromSubmission(s).map(toCsvCell).join(",")}\n`).join("");
  fs.writeFileSync(csvPath, head + body, "utf8");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PrizePayload;

    const sport = (body.sport || "").trim();
    const event = (body.event || "").trim();
    const category = (body.category || "").trim();
    const position = (body.position || "").trim();
    const prizeAmount = (body.prizeAmount || "").trim();
    const currency = (body.currency || "").trim();
    const prizeStructure = (body.prizeStructure || "").trim();
    const submitterName = (body.submitterName || "").trim();
    const submitterEmail = (body.submitterEmail || "").trim();
    const notes = (body.notes || "").trim();
    const website = (body.website || "").trim();

    if (website) return NextResponse.json({ error: "Spam check failed." }, { status: 400 });

    if (!sport || !event || !prizeStructure || !submitterName || !submitterEmail) {
      return NextResponse.json(
        { error: "Sport, Event, Prize Structure, Submitter Name, and Submitter Email are required." },
        { status: 400 }
      );
    }

    if (!validateEmail(submitterEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const list = readAll();
    const now = new Date().toISOString();
    const id = `PS-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const newRow: Submission = {
      id,
      sport,
      event,
      category,
      position,
      prizeAmount,
      currency,
      prizeStructure,
      submitterName,
      submitterEmail,
      notes,
      status: "Pending",
      adminComment: "",
      submittedAt: now,
      reviewedAt: "",
    };

    list.push(newRow);
    writeAll(list);

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to save prize submission", detail: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const list = readAll().reverse();
    return NextResponse.json({ submissions: list });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to read prize submissions", detail: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: string; status?: "Approved" | "Rejected" | "Pending"; adminComment?: string };
    const id = (body.id || "").trim();
    const status = body.status;
    const adminComment = (body.adminComment || "").trim();

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const list = readAll();
    const idx = list.findIndex((s) => s.id === id);
    if (idx < 0) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

    list[idx] = {
      ...list[idx],
      status,
      adminComment,
      reviewedAt: new Date().toISOString(),
    };

    writeAll(list);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to update submission", detail: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}
