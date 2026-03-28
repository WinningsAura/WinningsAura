import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSessionEmailFromRequest } from "@/lib/auth";

type Submission = {
  id: string;
  sport: string;
  event: string;
  category: string;
  position: string;
  prizeAmount: string;
  currency: string;
  status: string;
  adminComment: string;
  submittedAt: string;
  reviewedAt: string;
  submitterEmail: string;
};

function getCsvPath() {
  if (process.env.VERCEL) return path.join("/tmp", "prize-submissions.csv");
  return path.resolve(process.cwd(), "..", "prize-submissions.csv");
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

function mapRow(row: string[]): Submission {
  const legacy = row.length <= 15;
  if (legacy) {
    return {
      id: row[0] || "",
      sport: row[1] || "",
      event: row[2] || "",
      category: row[3] || "",
      position: row[4] || "",
      prizeAmount: row[5] || "",
      currency: row[6] || "",
      submitterEmail: (row[9] || "").toLowerCase(),
      status: row[11] || "Pending",
      adminComment: row[12] || "",
      submittedAt: row[13] || "",
      reviewedAt: row[14] || "",
    };
  }

  return {
    id: row[0] || "",
    sport: row[1] || "",
    event: row[2] || "",
    category: row[6] || "",
    position: row[7] || "",
    prizeAmount: row[8] || "",
    currency: row[9] || "",
    submitterEmail: (row[15] || "").toLowerCase(),
    status: row[17] || "Pending",
    adminComment: row[18] || "",
    submittedAt: row[19] || "",
    reviewedAt: row[20] || "",
  };
}

export async function GET(req: NextRequest) {
  const email = getSessionEmailFromRequest(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const csvPath = getCsvPath();
  if (!fs.existsSync(csvPath)) return NextResponse.json({ submissions: [] });

  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  if (rows.length <= 1) return NextResponse.json({ submissions: [] });

  const submissions = rows
    .slice(1)
    .map(mapRow)
    .filter((s) => s.submitterEmail === email)
    .reverse();

  return NextResponse.json({ submissions });
}
