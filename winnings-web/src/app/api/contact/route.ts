import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

const headers = ["Name", "Email", "Phone", "Message", "Submitted At"];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ContactPayload;

    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.phone || "").trim();
    const message = (body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, Email, and Message are required." }, { status: 400 });
    }

    const excelPath = path.resolve(process.cwd(), "..", "contact-submissions.xlsx");
    const sheetName = "Contact Us";

    let wb: XLSX.WorkBook;
    let ws: XLSX.WorkSheet;

    if (fs.existsSync(excelPath)) {
      wb = XLSX.readFile(excelPath);
      ws = wb.Sheets[sheetName] ?? XLSX.utils.aoa_to_sheet([headers]);
      if (!wb.SheetNames.includes(sheetName)) XLSX.utils.book_append_sheet(wb, ws, sheetName);
    } else {
      wb = XLSX.utils.book_new();
      ws = XLSX.utils.aoa_to_sheet([headers]);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    const row = [name, email, phone, message, new Date().toISOString()];
    XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 });

    const out = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
    fs.writeFileSync(excelPath, out);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to save contact submission", detail: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}
