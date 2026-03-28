import fs from "fs";
import path from "path";

export type UserRecord = {
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  resetTokenHash: string;
  resetTokenExpiresAt: string;
};

const headers = ["Email", "PasswordHash", "CreatedAt", "UpdatedAt", "ResetTokenHash", "ResetTokenExpiresAt"];

function csvPath() {
  if (process.env.VERCEL) return path.join("/tmp", "users.csv");
  return path.resolve(process.cwd(), "..", "users.csv");
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

export function readUsers(): UserRecord[] {
  const p = csvPath();
  if (!fs.existsSync(p)) return [];
  const rows = parseCsv(fs.readFileSync(p, "utf8"));
  if (rows.length <= 1) return [];
  return rows.slice(1).map((r) => ({
    email: (r[0] || "").toLowerCase(),
    passwordHash: r[1] || "",
    createdAt: r[2] || "",
    updatedAt: r[3] || "",
    resetTokenHash: r[4] || "",
    resetTokenExpiresAt: r[5] || "",
  }));
}

export function writeUsers(users: UserRecord[]) {
  const p = csvPath();
  const head = `${headers.map(toCsvCell).join(",")}\n`;
  const body = users
    .map((u) => [u.email, u.passwordHash, u.createdAt, u.updatedAt, u.resetTokenHash, u.resetTokenExpiresAt])
    .map((r) => `${r.map(toCsvCell).join(",")}\n`)
    .join("");
  fs.writeFileSync(p, head + body, "utf8");
}
