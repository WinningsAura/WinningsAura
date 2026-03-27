import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

type PrizePayload = {
  sport?: string;
  event?: string;
  country?: string;
  province?: string;
  city?: string;
  category?: string;
  position?: string;
  prizeAmount?: string;
  currency?: string;
  categoryDataJson?: string;
  categories?: PrizeCategory[];
  prizeStructure?: string;
  prizeBasis?: "Official" | "Modeled";
  sourceLink?: string;
  submitterName?: string;
  submitterEmail?: string;
  notes?: string;
  website?: string;
};

type Submission = {
  id: string;
  sport: string;
  event: string;
  country: string;
  province: string;
  city: string;
  category: string;
  position: string;
  prizeAmount: string;
  currency: string;
  categoryDataJson: string;
  prizeStructure: string;
  prizeBasis: "Official" | "Modeled";
  sourceLink: string;
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
  "Country",
  "Province",
  "City",
  "Category",
  "Position",
  "Prize Amount",
  "Currency",
  "Category Data JSON",
  "Prize Structure",
  "Prize Basis",
  "Source Link",
  "Submitter Name",
  "Submitter Email",
  "Notes",
  "Status",
  "Admin Comment",
  "Submitted At",
  "Reviewed At",
];

function getCsvPath() {
  if (process.env.VERCEL) return path.join("/tmp", "prize-submissions.csv");
  return path.resolve(process.cwd(), "..", "prize-submissions.csv");
}

const csvPath = getCsvPath();

function sanitizeFileName(name: string) {
  return (name || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "unknown";
}

function getPublishedPath(sport: string) {
  const file = `${sanitizeFileName(sport)}.csv`;
  if (process.env.VERCEL) return path.join("/tmp", "published-prize-submissions", file);
  return path.resolve(process.cwd(), "data", "published-prize-submissions", file);
}

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

function parseCategoryDataJson(raw: string, fallback: { category: string; position: string; prizeAmount: string; currency: string }): string {
  try {
    if (!raw) throw new Error("empty");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("bad");

    const cleaned = parsed
      .map((cat) => ({
        name: String(cat?.name || "").trim(),
        items: Array.isArray(cat?.items)
          ? cat.items.map((it: PrizeItem) => ({
              position: String(it?.position || "").trim(),
              prizeAmount: String(it?.prizeAmount || "").trim(),
              currency: String(it?.currency || "").trim().toUpperCase(),
            }))
          : [],
      }))
      .filter((cat) => cat.name || cat.items.some((it) => it.position || it.prizeAmount));

    if (cleaned.length > 0) return JSON.stringify(cleaned);
  } catch {
    // use fallback below
  }

  const fallbackCategory = [{
    name: fallback.category || "",
    items: [{
      position: fallback.position || "",
      prizeAmount: fallback.prizeAmount || "",
      currency: (fallback.currency || "USD").toUpperCase(),
    }],
  }];

  return JSON.stringify(fallbackCategory);
}

function toSubmission(row: string[]): Submission {
  const looksLegacy = row.length <= 15;

  if (looksLegacy) {
    const legacy = {
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

    return {
      ...legacy,
      country: "",
      province: "",
      city: "",
      categoryDataJson: parseCategoryDataJson("", legacy),
      prizeBasis: "Official",
      sourceLink: "",
    };
  }

  const modern = {
    id: row[0] || "",
    sport: row[1] || "",
    event: row[2] || "",
    country: row[3] || "",
    province: row[4] || "",
    city: row[5] || "",
    category: row[6] || "",
    position: row[7] || "",
    prizeAmount: row[8] || "",
    currency: row[9] || "",
    categoryDataJson: row[10] || "",
    prizeStructure: row[11] || "",
    prizeBasis: ((row[12] || "Official") as Submission["prizeBasis"]),
    sourceLink: row[13] || "",
    submitterName: row[14] || "",
    submitterEmail: row[15] || "",
    notes: row[16] || "",
    status: ((row[17] || "Pending") as Submission["status"]),
    adminComment: row[18] || "",
    submittedAt: row[19] || "",
    reviewedAt: row[20] || "",
  };

  return {
    ...modern,
    categoryDataJson: parseCategoryDataJson(modern.categoryDataJson, modern),
  };
}

function fromSubmission(s: Submission) {
  return [
    s.id,
    s.sport,
    s.event,
    s.country,
    s.province,
    s.city,
    s.category,
    s.position,
    s.prizeAmount,
    s.currency,
    s.categoryDataJson,
    s.prizeStructure,
    s.prizeBasis,
    s.sourceLink,
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

function appendPublishedRow(submission: Submission) {
  const publishedPath = getPublishedPath(submission.sport);
  const dir = path.dirname(publishedPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const publishedHeaders = [
    "Submission Id",
    "Sport",
    "Event",
    "Country",
    "Province",
    "City",
    "Category",
    "Position",
    "Prize Amount",
    "Currency",
    "Category Data JSON",
    "Prize Structure",
    "Prize Basis",
    "Source Link",
    "Submitter Name",
    "Submitter Email",
    "Admin Comment",
    "Published At",
  ];

  if (!fs.existsSync(publishedPath)) {
    fs.writeFileSync(publishedPath, `${publishedHeaders.map(toCsvCell).join(",")}\n`, "utf8");
  }

  const row = [
    submission.id,
    submission.sport,
    submission.event,
    submission.country,
    submission.province,
    submission.city,
    submission.category,
    submission.position,
    submission.prizeAmount,
    submission.currency,
    submission.categoryDataJson,
    submission.prizeStructure,
    submission.prizeBasis,
    submission.sourceLink,
    submission.submitterName,
    submission.submitterEmail,
    submission.adminComment,
    new Date().toISOString(),
  ];

  fs.appendFileSync(publishedPath, `${row.map(toCsvCell).join(",")}\n`, "utf8");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PrizePayload;

    const sport = (body.sport || "").trim();
    const event = (body.event || "").trim();
    const country = (body.country || "").trim();
    const province = (body.province || "").trim();
    const city = (body.city || "").trim();
    const prizeStructure = (body.prizeStructure || "").trim();
    const prizeBasis = (body.prizeBasis === "Modeled" ? "Modeled" : "Official") as Submission["prizeBasis"];
    const sourceLink = (body.sourceLink || "").trim();
    const submitterName = (body.submitterName || "").trim();
    const submitterEmail = (body.submitterEmail || "").trim();
    const notes = (body.notes || "").trim();
    const website = (body.website || "").trim();

    const normalizedCategories = Array.isArray(body.categories)
      ? body.categories
          .map((cat) => ({
            name: String(cat?.name || "").trim(),
            items: Array.isArray(cat?.items)
              ? cat.items.map((it) => ({
                  position: String(it?.position || "").trim(),
                  prizeAmount: String(it?.prizeAmount || "").trim(),
                  currency: String(it?.currency || "USD").trim().toUpperCase() || "USD",
                }))
              : [],
          }))
          .filter((cat) => cat.name || cat.items.some((it) => it.position || it.prizeAmount))
      : [];

    const fallbackCategory = (body.category || "").trim();
    const fallbackPosition = (body.position || "").trim();
    const fallbackPrizeAmount = (body.prizeAmount || "").trim();
    const fallbackCurrency = (body.currency || "").trim().toUpperCase();

    const categories = normalizedCategories.length > 0
      ? normalizedCategories
      : [{
          name: fallbackCategory,
          items: [{
            position: fallbackPosition,
            prizeAmount: fallbackPrizeAmount,
            currency: fallbackCurrency || "USD",
          }],
        }];

    const firstCategory = categories[0] || { name: "", items: [{ position: "", prizeAmount: "", currency: "USD" }] };
    const firstItem = firstCategory.items[0] || { position: "", prizeAmount: "", currency: "USD" };

    if (website) return NextResponse.json({ error: "Spam check failed." }, { status: 400 });

    if (!sport || !event || !country || !prizeStructure || !submitterName || !submitterEmail) {
      return NextResponse.json(
        { error: "Sport, Event, Country, Prize Structure, Submitter Name, and Submitter Email are required." },
        { status: 400 }
      );
    }

    if (prizeStructure.length < 20) {
      return NextResponse.json({ error: "Prize Structure must be at least 20 characters." }, { status: 400 });
    }

    if (prizeBasis === "Official" && !sourceLink) {
      return NextResponse.json({ error: "Source link is required for official amounts." }, { status: 400 });
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
      country,
      province,
      city,
      category: firstCategory.name,
      position: firstItem.position,
      prizeAmount: firstItem.prizeAmount,
      currency: firstItem.currency,
      categoryDataJson: parseCategoryDataJson(body.categoryDataJson || JSON.stringify(categories), {
        category: firstCategory.name,
        position: firstItem.position,
        prizeAmount: firstItem.prizeAmount,
        currency: firstItem.currency,
      }),
      prizeStructure,
      prizeBasis,
      sourceLink,
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
    const body = (await req.json()) as {
      id?: string;
      status?: "Approved" | "Rejected" | "Pending";
      adminComment?: string;
      publish?: boolean;
    };

    const id = (body.id || "").trim();
    const status = body.status;
    const adminComment = (body.adminComment || "").trim();
    const publish = Boolean(body.publish);

    if (!id || (!status && !publish)) {
      return NextResponse.json({ error: "id and status (or publish=true) are required" }, { status: 400 });
    }

    const list = readAll();
    const idx = list.findIndex((s) => s.id === id);
    if (idx < 0) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

    const nextStatus = publish ? "Approved" : status!;

    list[idx] = {
      ...list[idx],
      status: nextStatus,
      adminComment,
      reviewedAt: new Date().toISOString(),
    };

    if (publish) appendPublishedRow(list[idx]);

    writeAll(list);
    return NextResponse.json({ ok: true, published: publish });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to update submission", detail: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}
