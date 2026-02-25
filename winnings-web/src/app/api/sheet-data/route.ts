import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const sheetToCsv: Record<string, string> = {
  "Tennis Grand Slams": "Tennis Grand Slams.csv",
  "ATP and WTA": "ATP and WTA.csv",
  Cricket: "Cricket.csv",
  Golf: "Golf.csv",
  "All Sports Match Total Times": "All Sports Match Total Times.csv",
  "About Us": "About Us.csv",
};

function findExistingPath(candidates: string[]) {
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
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

function normalizeRows(rows: string[][]) {
  const nonEmpty = rows.filter((r) => r.some((c) => (c || "").trim() !== ""));
  const maxCols = nonEmpty.reduce((m, r) => Math.max(m, r.length), 0);
  return nonEmpty.map((r) => [...r, ...Array(Math.max(0, maxCols - r.length)).fill("")]);
}

function loadRowsFromXlsx(xlsxPath: string, sheet: string) {
  try {
    const wb = XLSX.readFile(xlsxPath, { cellText: true, cellNF: false, cellDates: false });
    const ws = wb.Sheets[sheet];
    if (!ws) return null;
    const aoa = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
      header: 1,
      raw: false,
      blankrows: true,
      defval: "",
    });
    const rows = aoa.map((r) => r.map((c) => String(c ?? "")));
    return normalizeRows(rows);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const sheet = req.nextUrl.searchParams.get("sheet");
    if (!sheet) return NextResponse.json({ error: "Missing sheet" }, { status: 400 });

    const csvFile = sheetToCsv[sheet];
    if (!csvFile) return NextResponse.json({ error: `Sheet not found: ${sheet}` }, { status: 404 });

    const cwd = process.cwd();
    const csvPath = findExistingPath([
      path.resolve(cwd, "winnings-sheets", csvFile),
      path.resolve(cwd, "data", "winnings-sheets", csvFile),
      path.resolve(cwd, "..", "winnings-sheets", csvFile), // backward-compatible local layout
    ]);

    if (csvPath) {
      const csvText = fs.readFileSync(csvPath, "utf8");
      const rows = normalizeRows(parseCsv(csvText));

      return NextResponse.json(
        { sheet, rows },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    const xlsxPath = findExistingPath([
      path.resolve(cwd, "Winnings.xlsx"),
      path.resolve(cwd, "data", "Winnings.xlsx"),
      path.resolve(cwd, "..", "Winnings.xlsx"), // backward-compatible local layout
    ]);

    if (xlsxPath) {
      const xlsxRows = loadRowsFromXlsx(xlsxPath, sheet);
      if (xlsxRows && xlsxRows.length) {
        return NextResponse.json(
          { sheet, rows: xlsxRows },
          {
            headers: {
              "Cache-Control": "no-store, max-age=0",
            },
          }
        );
      }
    }

    return NextResponse.json(
      {
        error: `Data file missing for sheet: ${sheet}`,
        checked: [
          path.resolve(cwd, "winnings-sheets", csvFile),
          path.resolve(cwd, "data", "winnings-sheets", csvFile),
          path.resolve(cwd, "..", "winnings-sheets", csvFile),
          path.resolve(cwd, "Winnings.xlsx"),
          path.resolve(cwd, "data", "Winnings.xlsx"),
          path.resolve(cwd, "..", "Winnings.xlsx"),
        ],
      },
      { status: 404 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load sheet", detail: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}
