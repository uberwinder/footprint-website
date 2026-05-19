import { google } from "googleapis";
import { logger } from "./logger";

const SERVICE_ACCOUNT_EMAIL = "footprint-feedback@footprint-navigator.iam.gserviceaccount.com";

// ─── Demo Requests sheet ───────────────────────────────────────────────────────
const DEMO_SHEET_ID = process.env["GOOGLE_SHEET_ID"] ?? "";
const DEMO_TAB = "Demo Requests";
const DEMO_HEADERS = [
  "Submitted At", "First Name", "Last Name", "Work Email",
  "Token", "Token Expiry", "IP Address",
];

// ─── Trial Customers sheet ─────────────────────────────────────────────────────
const TRIAL_SHEET_ID = process.env["TRIAL_CUSTOMERS_SHEET_ID"] ?? "";
const TRIAL_TAB = "Sheet1";
const TRIAL_HEADERS = [
  "Timestamp", "Full Name", "Company", "Work Email",
  "Job Role", "Phone Number", "Company Size", "Early Access",
  "NDA Date", "Sample Docs",
];

// ─── 5-minute in-memory cache for trial count ─────────────────────────────────
let trialCountCache: { count: number; expiresAt: number } | null = null;

// ─── Auth ──────────────────────────────────────────────────────────────────────
function getAuth() {
  const raw = (process.env["GOOGLE_SERVICE_ACCOUNT_KEY"] ?? "").replace(/\\n/g, "\n");
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not set");
  let privateKey: string;
  try {
    const parsed = JSON.parse(raw) as { private_key?: string };
    privateKey = parsed.private_key ?? raw;
  } catch {
    privateKey = raw;
  }
  return new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

// ─── Demo Requests helpers ─────────────────────────────────────────────────────
async function ensureDemoHeaderRow(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
): Promise<void> {
  try {
    const meta = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${DEMO_TAB}!A1:A1`,
    });
    if (meta.data.values?.[0]?.[0] === DEMO_HEADERS[0]) return;
  } catch {
    logger.info(`Creating sheet tab "${DEMO_TAB}"`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: DEMO_TAB } } }] },
    });
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${DEMO_TAB}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [DEMO_HEADERS] },
  });
  logger.info(`Header row written to "${DEMO_TAB}" sheet`);
}

export async function appendDemoRequestRow(data: {
  submittedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
  expiresAt: string;
  ip: string;
}): Promise<void> {
  if (!DEMO_SHEET_ID) {
    logger.warn("GOOGLE_SHEET_ID not set — skipping Sheets write");
    return;
  }
  const sheets = getSheetsClient();
  await ensureDemoHeaderRow(sheets, DEMO_SHEET_ID);
  await sheets.spreadsheets.values.append({
    spreadsheetId: DEMO_SHEET_ID,
    range: `${DEMO_TAB}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[
        data.submittedAt, data.firstName, data.lastName,
        data.email, data.token, data.expiresAt, data.ip,
      ]],
    },
  });
  logger.info({ email: data.email }, "Demo request appended to Google Sheet");
}

// ─── Trial Customers helpers ───────────────────────────────────────────────────
async function ensureTrialHeaderRow(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
): Promise<void> {
  try {
    const meta = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${TRIAL_TAB}!A1:A1`,
    });
    if (meta.data.values?.[0]?.[0] === TRIAL_HEADERS[0]) return;
  } catch {
    // proceed to write headers
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${TRIAL_TAB}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [TRIAL_HEADERS] },
  });
  logger.info(`Header row written to "${TRIAL_TAB}" tab`);
}

export async function appendTrialCustomerRow(data: {
  name: string;
  company: string;
  email: string;
  role: string;
  phone: string;
  companySize: string;
  earlyAccess: string;
}): Promise<void> {
  if (!TRIAL_SHEET_ID) {
    logger.warn("TRIAL_CUSTOMERS_SHEET_ID not set — skipping Sheets write");
    return;
  }
  const sheets = getSheetsClient();
  await ensureTrialHeaderRow(sheets, TRIAL_SHEET_ID);
  await sheets.spreadsheets.values.append({
    spreadsheetId: TRIAL_SHEET_ID,
    range: `${TRIAL_TAB}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[
        new Date().toISOString(),
        data.name, data.company, data.email, data.role,
        data.phone || "—", data.companySize, data.earlyAccess,
        "", // NDA Date — filled later
        "", // Sample Docs — filled manually
      ]],
    },
  });
  trialCountCache = null; // bust cache
  logger.info({ email: data.email }, "Trial customer appended to Google Sheet");
}

export async function updateNdaDate(email: string, ndaDate: string): Promise<void> {
  if (!TRIAL_SHEET_ID) {
    logger.warn("TRIAL_CUSTOMERS_SHEET_ID not set — skipping NDA date update");
    return;
  }
  const sheets = getSheetsClient();

  // Fetch all emails from column D (Work Email)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: TRIAL_SHEET_ID,
    range: `${TRIAL_TAB}!D:D`,
  });

  const rows = res.data.values ?? [];
  // Find the 1-indexed row where email matches (skip header at index 0)
  let matchRow = -1;
  for (let i = 1; i < rows.length; i++) {
    if ((rows[i]?.[0] ?? "").toLowerCase() === email.toLowerCase()) {
      matchRow = i + 1; // 1-indexed sheet row
      break;
    }
  }

  if (matchRow === -1) {
    logger.warn({ email }, "Email not found in Trial Customers sheet for NDA update");
    return;
  }

  // Column I is NDA Date (index 9 = column I)
  await sheets.spreadsheets.values.update({
    spreadsheetId: TRIAL_SHEET_ID,
    range: `${TRIAL_TAB}!I${matchRow}`,
    valueInputOption: "RAW",
    requestBody: { values: [[ndaDate]] },
  });
  logger.info({ email, matchRow, ndaDate }, "NDA date updated in Google Sheet");
}

// ─── Demo token helpers ────────────────────────────────────────────────────────

export async function validateDemoToken(
  token: string,
): Promise<{ valid: true; firstName: string } | { valid: false; error: string }> {
  if (!DEMO_SHEET_ID) {
    return { valid: false, error: "Demo access unavailable" };
  }
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: DEMO_SHEET_ID,
    range: `${DEMO_TAB}!A:G`,
  });
  const rows = res.data.values ?? [];
  // Columns: A=Submitted At, B=First Name, C=Last Name, D=Work Email, E=Token, F=Token Expiry, G=IP
  for (let i = 1; i < rows.length; i++) {
    const rowToken = (rows[i]?.[4] ?? "") as string;
    if (rowToken === token) {
      const expiresAt = new Date((rows[i]?.[5] ?? "") as string);
      if (isNaN(expiresAt.getTime()) || Date.now() > expiresAt.getTime()) {
        return { valid: false, error: "This link has expired" };
      }
      return { valid: true, firstName: (rows[i]?.[1] ?? "") as string };
    }
  }
  return { valid: false, error: "Invalid or expired link" };
}

export async function getAllDemoRequests(): Promise<Record<string, string>[]> {
  if (!DEMO_SHEET_ID) return [];
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: DEMO_SHEET_ID,
    range: `${DEMO_TAB}!A:G`,
  });
  const rows = res.data.values ?? [];
  if (rows.length < 2) return [];
  const headers = (rows[0] ?? DEMO_HEADERS) as string[];
  return rows.slice(1).map((row) =>
    Object.fromEntries(headers.map((h, i) => [h, (row[i] ?? "") as string])),
  );
}

export async function getTrialCustomerCount(): Promise<number> {
  if (trialCountCache && Date.now() < trialCountCache.expiresAt) {
    return trialCountCache.count;
  }
  if (!TRIAL_SHEET_ID) {
    logger.warn("TRIAL_CUSTOMERS_SHEET_ID not set — returning 0");
    return 0;
  }
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: TRIAL_SHEET_ID,
    range: `${TRIAL_TAB}!A:A`,
  });
  const totalRows = res.data.values?.length ?? 0;
  const count = Math.max(0, totalRows - 1);
  trialCountCache = { count, expiresAt: Date.now() + 5 * 60 * 1000 };
  logger.info({ count }, "Trial customer count fetched from Google Sheet");
  return count;
}
