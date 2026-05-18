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
];

// ─── 5-minute in-memory cache for trial count ─────────────────────────────────
let trialCountCache: { count: number; expiresAt: number } | null = null;

// ─── Auth ──────────────────────────────────────────────────────────────────────
function getAuth(scopes: string[]) {
  const raw = (process.env["GOOGLE_SERVICE_ACCOUNT_KEY"] ?? "").replace(/\\n/g, "\n");
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not set");
  let privateKey: string;
  try {
    const parsed = JSON.parse(raw) as { private_key?: string };
    privateKey = parsed.private_key ?? raw;
  } catch {
    privateKey = raw;
  }
  return new google.auth.JWT({ email: SERVICE_ACCOUNT_EMAIL, key: privateKey, scopes });
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
  const auth = getAuth(["https://www.googleapis.com/auth/spreadsheets"]);
  const sheets = google.sheets({ version: "v4", auth });
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
    logger.info(`Tab "${TRIAL_TAB}" not found — will write headers anyway`);
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
  const auth = getAuth(["https://www.googleapis.com/auth/spreadsheets"]);
  const sheets = google.sheets({ version: "v4", auth });
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
      ]],
    },
  });
  // Bust the count cache so next fetch is fresh
  trialCountCache = null;
  logger.info({ email: data.email }, "Trial customer appended to Google Sheet");
}

export async function getTrialCustomerCount(): Promise<number> {
  // Serve from cache if still valid
  if (trialCountCache && Date.now() < trialCountCache.expiresAt) {
    return trialCountCache.count;
  }
  if (!TRIAL_SHEET_ID) {
    logger.warn("TRIAL_CUSTOMERS_SHEET_ID not set — returning 0");
    return 0;
  }
  const auth = getAuth(["https://www.googleapis.com/auth/spreadsheets"]);
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: TRIAL_SHEET_ID,
    range: `${TRIAL_TAB}!A:A`,
  });
  const totalRows = res.data.values?.length ?? 0;
  const count = Math.max(0, totalRows - 1); // subtract header row
  trialCountCache = { count, expiresAt: Date.now() + 5 * 60 * 1000 };
  logger.info({ count }, "Trial customer count fetched from Google Sheet");
  return count;
}
