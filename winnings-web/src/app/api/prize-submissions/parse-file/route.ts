import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const runtime = "nodejs";

type PrizeItem = {
  position: string;
  prizeAmount: string;
  currency: string;
};

type PrizeCategory = {
  name: string;
  items: PrizeItem[];
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function pickValue(row: Record<string, string>, names: string[]) {
  for (const n of names) {
    if (row[n]) return row[n];
  }
  return "";
}

function parseRowsToCategories(rows: Record<string, string>[]): PrizeCategory[] {
  const map = new Map<string, PrizeItem[]>();

  for (const row of rows) {
    const category = pickValue(row, ["category", "division", "gender", "class"]) || "General";
    const position = pickValue(row, ["position", "place", "rank", "finish"]);
    const prizeAmount = pickValue(row, ["prize amount", "amount", "prize", "payout", "money"]);
    const currency = (pickValue(row, ["currency", "curr", "ccy"]) || "USD").toUpperCase();

    if (!position && !prizeAmount) continue;

    if (!map.has(category)) map.set(category, []);
    map.get(category)?.push({ position, prizeAmount, currency });
  }

  return [...map.entries()].map(([name, items]) => ({ name, items }));
}

function extractSimpleField(text: string, labels: string[]) {
  for (const label of labels) {
    const regex = new RegExp(`${label}\\s*[:\\-]\\s*(.+)`, "i");
    const match = text.match(regex);
    if (match?.[1]) return match[1].split(/\r?\n/)[0].trim();
  }
  return "";
}

function extractCategoriesFromText(text: string): PrizeCategory[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const categories: PrizeCategory[] = [];
  let current: PrizeCategory = { name: "General", items: [] };

  for (const line of lines) {
    const categoryMatch = line.match(/^(category|division|gender)\s*[:\-]\s*(.+)$/i);
    if (categoryMatch) {
      if (current.items.length > 0 || current.name) categories.push(current);
      current = { name: categoryMatch[2].trim(), items: [] };
      continue;
    }

    const prizeMatch = line.match(/^([A-Za-z0-9\-\s\.\/]+?)\s*[:\-]\s*([A-Z]{3})?\s*([\d,]+(?:\.\d+)?)/);
    if (prizeMatch) {
      current.items.push({
        position: prizeMatch[1].trim(),
        currency: (prizeMatch[2] || "USD").toUpperCase(),
        prizeAmount: prizeMatch[3],
      });
    }
  }

  if (current.items.length > 0 || current.name) categories.push(current);

  return categories.filter((cat) => cat.items.length > 0);
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if ([".xlsx", ".xls", ".csv"].includes(ext)) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

      const rows = rawRows.map((row) => {
        const normalized: Record<string, string> = {};
        for (const [k, v] of Object.entries(row)) {
          normalized[normalizeHeader(k)] = String(v || "").trim();
        }
        return normalized;
      });

      const first = rows[0] || {};
      const categories = parseRowsToCategories(rows);

      return NextResponse.json({
        sport: pickValue(first, ["sport", "game"]),
        event: pickValue(first, ["event", "tournament", "competition"]),
        country: pickValue(first, ["country", "nation"]),
        province: pickValue(first, ["province", "state", "region"]),
        city: pickValue(first, ["city", "town"]),
        sourceLink: pickValue(first, ["source", "source link", "url", "link"]),
        categories,
      });
    }

    if (ext === ".pdf") {
      const parsed = await pdfParse(buffer);
      const text = parsed.text || "";
      return NextResponse.json({
        sport: extractSimpleField(text, ["sport", "game"]),
        event: extractSimpleField(text, ["event", "tournament", "competition"]),
        country: extractSimpleField(text, ["country", "nation"]),
        province: extractSimpleField(text, ["province", "state", "region"]),
        city: extractSimpleField(text, ["city", "town"]),
        sourceLink: extractSimpleField(text, ["source", "source link", "url", "link"]),
        categories: extractCategoriesFromText(text),
        extractedNote: "Auto-filled from PDF using text extraction. Please verify all values.",
      });
    }

    if (ext === ".docx") {
      const parsed = await mammoth.extractRawText({ buffer });
      const text = parsed.value || "";
      return NextResponse.json({
        sport: extractSimpleField(text, ["sport", "game"]),
        event: extractSimpleField(text, ["event", "tournament", "competition"]),
        country: extractSimpleField(text, ["country", "nation"]),
        province: extractSimpleField(text, ["province", "state", "region"]),
        city: extractSimpleField(text, ["city", "town"]),
        sourceLink: extractSimpleField(text, ["source", "source link", "url", "link"]),
        categories: extractCategoriesFromText(text),
        extractedNote: "Auto-filled from DOCX using text extraction. Please verify all values.",
      });
    }

    if (ext === ".doc") {
      const text = buffer.toString("latin1").replace(/[^\x20-\x7E\n\r]/g, " ");
      return NextResponse.json({
        sport: extractSimpleField(text, ["sport", "game"]),
        event: extractSimpleField(text, ["event", "tournament", "competition"]),
        country: extractSimpleField(text, ["country", "nation"]),
        province: extractSimpleField(text, ["province", "state", "region"]),
        city: extractSimpleField(text, ["city", "town"]),
        sourceLink: extractSimpleField(text, ["source", "source link", "url", "link"]),
        categories: extractCategoriesFromText(text),
        extractedNote: "Best-effort parse from DOC. Please verify and adjust values.",
      });
    }

    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to parse file", detail: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}
