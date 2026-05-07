import { google } from "googleapis";
import { logger } from "./logger";

const SHEET_ID = process.env["GOOGLE_SHEET_ID"] ?? "";
const SERVICE_ACCOUNT_EMAIL = "footprint-feedback@footprint-navigator.iam.gserviceaccount.com";
const TAB_NAME = "Demo Requests";
const HEADERS = [
  "Submitted At",
  "First Name",
  "Last Name",
  "Work Email",
  "Token",
  "Token Expiry",
  "IP Address",
];

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

async function ensureHeaderRow(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
): Promise<void> {
  // Check the first cell to see if the header is already written
  try {
    const meta = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${TAB_NAME}!A1:A1`,
    });
    const firstCell = meta.data.values?.[0]?.[0] ?? "";
    if (firstCell === HEADERS[0]) return; // header already present
  } catch {
    // Tab doesn't exist yet — create it first, then write the header
    logger.info(`Creating sheet tab "${TAB_NAME}"`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: TAB_NAME } } }],
      },
    });
  }

  // Write the header row
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${TAB_NAME}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [HEADERS] },
  });

  logger.info(`Header row written to "${TAB_NAME}" sheet`);
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
  if (!SHEET_ID) {
    logger.warn("GOOGLE_SHEET_ID not set — skipping Sheets write");
    return;
  }

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  await ensureHeaderRow(sheets, SHEET_ID);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${TAB_NAME}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          data.submittedAt,
          data.firstName,
          data.lastName,
          data.email,
          data.token,
          data.expiresAt,
          data.ip,
        ],
      ],
    },
  });

  logger.info({ email: data.email }, "Demo request appended to Google Sheet");
}
