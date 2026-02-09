import { NextRequest, NextResponse } from "next/server";
import path from "path";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  try {
    const sheet = req.nextUrl.searchParams.get("sheet");
    if (!sheet) return NextResponse.json({ error: "Missing sheet" }, { status: 400 });

    const filePath = path.resolve(process.cwd(), "..", "Winnings.xlsx");
    const wb = XLSX.readFile(filePath);

    if (!wb.SheetNames.includes(sheet)) {
      return NextResponse.json({ error: `Sheet not found: ${sheet}` }, { status: 404 });
    }

    const ws = wb.Sheets[sheet];
    const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(ws, {
      header: 1,
      blankrows: false,
      defval: "",
      raw: false,
    });

    const strRows = rows.map((r) => r.map((c) => (c ?? "").toString()));
    const maxCols = strRows.reduce((m, r) => Math.max(m, r.length), 0);
    const padded = strRows.map((r) => [...r, ...Array(Math.max(0, maxCols - r.length)).fill("")]);

    return NextResponse.json({ sheet, rows: padded });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load sheet", detail: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}
