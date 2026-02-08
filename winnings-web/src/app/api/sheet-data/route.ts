import { NextRequest, NextResponse } from "next/server";
import path from "path";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  try {
    const sheetName = req.nextUrl.searchParams.get("sheet");

    if (!sheetName) {
      return NextResponse.json({ error: "Missing sheet parameter" }, { status: 400 });
    }

    const workbookPath = path.resolve(process.cwd(), "..", "Winnings.xlsx");
    const workbook = XLSX.readFile(workbookPath, { cellDates: true });

    if (!workbook.SheetNames.includes(sheetName)) {
      return NextResponse.json({ error: `Sheet not found: ${sheetName}` }, { status: 404 });
    }

    const ws = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(ws, {
      header: 1,
      blankrows: false,
      defval: "",
      raw: false,
    });

    const normalized = rows.map((r) => r.map((c) => (c ?? "").toString()));
    const maxCols = normalized.reduce((m, r) => Math.max(m, r.length), 0);
    const padded = normalized.map((r) => [...r, ...Array(Math.max(0, maxCols - r.length)).fill("")]);

    return NextResponse.json({ sheetName, rows: padded });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read Excel sheet", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
