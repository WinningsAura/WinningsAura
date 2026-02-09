import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

const sheetToCsv: Record<string, string> = {
  "Tennis Grand Slams": "Tennis Grand Slams.csv",
  "ATP and WTA": "ATP and WTA.csv",
  Cricket: "Cricket.csv",
  "All Sports Match Total Times": "All Sports Match Total Times.csv",
  "About Us": "About Us.csv",
};

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

export async function GET(req: NextRequest) {
  try {
    const sheet = req.nextUrl.searchParams.get("sheet");
    if (!sheet) return NextResponse.json({ error: "Missing sheet" }, { status: 400 });

    const csvFile = sheetToCsv[sheet];
    if (!csvFile) return NextResponse.json({ error: `Sheet not found: ${sheet}` }, { status: 404 });

    const csvPath = path.resolve(process.cwd(), "..", "winnings-sheets", csvFile);
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: `Data file missing for sheet: ${sheet}`, csvPath }, { status: 404 });
    }

    const csvText = fs.readFileSync(csvPath, "utf8");
    const rows = parseCsv(csvText);

    const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0);
    const padded = rows.map((r) => [...r, ...Array(Math.max(0, maxCols - r.length)).fill("")]);

    return NextResponse.json({ sheet, rows: padded });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load sheet", detail: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}
