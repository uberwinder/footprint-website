import { Router, type IRouter } from "express";
import { Resend } from "resend";
import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import { google } from "googleapis";
import { updateNdaDate } from "../lib/sheets.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const SERVICE_ACCOUNT_EMAIL = "footprint-feedback@footprint-navigator.iam.gserviceaccount.com";
const TRIAL_SHEET_ID = process.env["TRIAL_CUSTOMERS_SHEET_ID"] ?? "";
const TRIAL_TAB = "Sheet1";

function getSheetsClient() {
  const raw = (process.env["GOOGLE_SERVICE_ACCOUNT_KEY"] ?? "").replace(/\\n/g, "\n");
  let privateKey: string;
  try {
    const parsed = JSON.parse(raw) as { private_key?: string };
    privateKey = parsed.private_key ?? raw;
  } catch {
    privateKey = raw;
  }
  const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function lookupCustomerByEmail(email: string): Promise<{ name: string; company: string }> {
  if (!TRIAL_SHEET_ID) return { name: "", company: "" };
  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: TRIAL_SHEET_ID,
      range: `${TRIAL_TAB}!A:J`,
    });
    const rows = res.data.values ?? [];
    for (let i = 1; i < rows.length; i++) {
      const rowEmail = (rows[i]?.[3] ?? "") as string;
      if (rowEmail.toLowerCase() === email.toLowerCase()) {
        return {
          name: (rows[i]?.[1] ?? "") as string,
          company: (rows[i]?.[2] ?? "") as string,
        };
      }
    }
  } catch (err) {
    logger.warn({ err }, "lookupCustomerByEmail failed");
  }
  return { name: "", company: "" };
}

// Fetch Dancing Script TTF bytes via old User-Agent trick (gets TTF, not WOFF2)
async function fetchDancingScriptTtf(): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      "https://fonts.googleapis.com/css?family=Dancing+Script:700",
      { headers: { "User-Agent": "Mozilla/4.0 (compatible; MSIE 5.5; Windows NT 5.0)" } },
    );
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\(([^)]+\.ttf)\)/i)
      ?? css.match(/url\(([^)]+)\)/i);
    if (!match?.[1]) return null;
    const fontRes = await fetch(match[1].replace(/['"]/g, ""));
    return fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

const NDA_SECTIONS = [
  {
    heading: "FOOTPRINT TECHNOLOGIES",
    subheading: "CONFIDENTIALITY ACKNOWLEDGMENT",
    body: null,
  },
  {
    heading: "1. PURPOSE",
    body: "The Company is providing Recipient with access to proprietary software, product information, technical data, and business information related to Footprint Navigator, an AI-powered document navigation platform developed for the construction industry (the \"Purpose\"). In connection with the Purpose, the Company may disclose Confidential Information as defined below.",
  },
  {
    heading: "2. DEFINITION OF CONFIDENTIAL INFORMATION",
    body: "\"Confidential Information\" means any and all information or data that has or could have commercial value or other utility in the business in which Company is engaged, including but not limited to: software source code, product designs, algorithms, technical specifications, user interfaces, business strategies, customer data, financial projections, research and development activities, and any other information the Company designates as confidential or that, under the circumstances of disclosure, would reasonably be understood to be confidential.",
  },
  {
    heading: "3. OBLIGATIONS OF RECIPIENT",
    body: "Recipient agrees to: (a) hold all Confidential Information in strict confidence; (b) not disclose Confidential Information to any third party without prior written consent of Company; (c) use Confidential Information solely for the Purpose described herein; (d) protect Confidential Information using at least the same degree of care used to protect Recipient's own confidential information, but no less than reasonable care; (e) limit access to Confidential Information to those employees or agents with a need to know; and (f) promptly notify Company of any unauthorized use or disclosure of Confidential Information.",
  },
  {
    heading: "4. EXCLUSIONS",
    body: "The obligations of this Agreement do not apply to information that: (a) is or becomes publicly available through no fault of Recipient; (b) was known to Recipient prior to disclosure by Company without restriction on disclosure; (c) is independently developed by Recipient without use of Confidential Information; (d) is received from a third party who has the right to disclose it without restriction; or (e) is required to be disclosed by applicable law, regulation, or court order, provided that Recipient provides Company with prompt written notice and cooperates in seeking a protective order.",
  },
  {
    heading: "5. OWNERSHIP",
    body: "All Confidential Information remains the sole and exclusive property of Company. Nothing in this Agreement grants Recipient any license, right, title, or interest in or to the Confidential Information, except the limited right to use it for the Purpose.",
  },
  {
    heading: "6. TERM",
    body: "This Agreement shall remain in effect for a period of three (3) years from the date of signing. Obligations of confidentiality with respect to trade secrets shall survive termination indefinitely.",
  },
  {
    heading: "7. RETURN OF INFORMATION",
    body: "Upon written request by Company or upon termination of this Agreement, Recipient shall promptly return or certify the destruction of all Confidential Information and all copies, notes, extracts, and summaries thereof.",
  },
  {
    heading: "8. NO WARRANTIES",
    body: "Company makes no representations or warranties regarding the accuracy or completeness of the Confidential Information. Company shall not be liable to Recipient for any damages arising from Recipient's use of or reliance on the Confidential Information.",
  },
  {
    heading: "9. REMEDIES",
    body: "Recipient acknowledges that breach of this Agreement may cause irreparable harm to Company for which monetary damages would be inadequate. Accordingly, in addition to any other available remedies, Company shall be entitled to seek injunctive or other equitable relief to enforce the terms of this Agreement without posting bond or other security.",
  },
  {
    heading: "10. GENERAL PROVISIONS",
    body: "(a) This Agreement constitutes the entire agreement between the parties regarding the subject matter hereof and supersedes all prior discussions. (b) This Agreement may not be amended except by a written instrument signed by both parties. (c) This Agreement shall be governed by the laws of the jurisdiction in which Company is incorporated, without regard to conflict of law provisions. (d) If any provision is found to be unenforceable, the remaining provisions shall remain in full force. (e) No failure or delay in exercising any right shall constitute a waiver of that right.",
  },
];

async function buildSignedPdf(data: {
  signerName: string;
  company: string;
  title: string;
  email: string;
  signatureText: string;
  signedDate: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Try to get Dancing Script for the signature
  const ttfBytes = await fetchDancingScriptTtf();
  let sigFont: PDFFont = helveticaBold;
  if (ttfBytes) {
    try {
      sigFont = await doc.embedFont(ttfBytes);
    } catch {
      sigFont = helveticaBold;
    }
  }

  const margin = 72;
  const pageW = 612;
  const pageH = 792;

  let page = doc.addPage([pageW, pageH]);
  let y = pageH - margin;

  function newPage() {
    page = doc.addPage([pageW, pageH]);
    y = pageH - margin;
  }

  function checkY(needed: number) {
    if (y - needed < margin + 40) newPage();
  }

  function wrapText(text: string, font: PDFFont, size: number, maxW: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxW && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function drawWrapped(text: string, font: PDFFont, size: number, lineH: number, color = rgb(0, 0, 0), indent = 0) {
    const lines = wrapText(text, font, size, pageW - margin * 2 - indent);
    for (const line of lines) {
      checkY(size + 4);
      page.drawText(line, { x: margin + indent, y, font, size, color });
      y -= lineH;
    }
  }

  // ── Cover header ──────────────────────────────────────────────────────────
  page.drawText("FOOTPRINT TECHNOLOGIES", {
    x: margin, y, font: helveticaBold, size: 11, color: rgb(0, 0.48, 1),
  });
  y -= 20;
  page.drawText("CONFIDENTIALITY ACKNOWLEDGMENT", {
    x: margin, y, font: helveticaBold, size: 16, color: rgb(0, 0, 0),
  });
  y -= 10;
  page.drawLine({
    start: { x: margin, y }, end: { x: pageW - margin, y },
    thickness: 1.5, color: rgb(0, 0.48, 1),
  });
  y -= 24;

  // ── NDA sections ─────────────────────────────────────────────────────────
  for (const section of NDA_SECTIONS) {
    if (!section.body) continue;
    checkY(40);
    drawWrapped(section.heading, helveticaBold, 10, 14);
    y -= 2;
    drawWrapped(section.body, helvetica, 10, 14.5);
    y -= 10;
  }

  // ── Signature block ──────────────────────────────────────────────────────
  checkY(200);
  y -= 8;
  page.drawLine({
    start: { x: margin, y }, end: { x: pageW - margin, y },
    thickness: 0.5, color: rgb(0.7, 0.7, 0.7),
  });
  y -= 20;
  page.drawText("By signing below, the Recipient agrees to be legally bound by the terms of this Confidentiality Acknowledgment.", {
    x: margin, y, font: helvetica, size: 9.5, color: rgb(0.3, 0.3, 0.3),
    maxWidth: pageW - margin * 2,
  });
  y -= 28;

  // Signature (Dancing Script / bold)
  const labelX = margin;
  const labelX2 = margin + 300;

  function sigField(label: string, value: string, x: number, lineW: number, font: PDFFont, fontSize: number, valueColor = rgb(0, 0, 0)) {
    page.drawText(label, { x, y: y + 2, font: helvetica, size: 8, color: rgb(0.5, 0.5, 0.5) });
    y -= 4;
    page.drawText(value, { x, y, font, size: fontSize, color: valueColor, maxWidth: lineW - 8 });
    y -= 4;
    page.drawLine({
      start: { x, y }, end: { x: x + lineW, y },
      thickness: 0.6, color: rgb(0.4, 0.4, 0.4),
    });
    y -= 16;
  }

  // Row 1: Signature (full width)
  const sigFontSize = ttfBytes ? 26 : 14;
  page.drawText("Signature", { x: labelX, y: y + 2, font: helvetica, size: 8, color: rgb(0.5, 0.5, 0.5) });
  y -= 4;
  page.drawText(data.signatureText, {
    x: labelX, y, font: sigFont, size: sigFontSize,
    color: rgb(0, 0, 0), maxWidth: pageW - margin * 2,
  });
  y -= 4;
  page.drawLine({
    start: { x: margin, y }, end: { x: pageW - margin, y },
    thickness: 0.6, color: rgb(0.4, 0.4, 0.4),
  });
  y -= 20;

  // Row 2: Name | Company
  const halfW = (pageW - margin * 2 - 20) / 2;
  const savedY = y;
  sigField("Name", data.signerName, labelX, halfW, helvetica, 11);
  const afterLeft = y;
  y = savedY;
  sigField("Company", data.company, labelX2, halfW, helvetica, 11);
  y = Math.min(afterLeft, y);

  // Row 3: Title | Date
  const savedY2 = y;
  sigField("Title", data.title || "—", labelX, halfW, helvetica, 11);
  const afterLeft2 = y;
  y = savedY2;
  sigField("Date", data.signedDate, labelX2, halfW, helvetica, 11);
  y = Math.min(afterLeft2, y);

  // Row 4: Email (full width)
  sigField("Email", data.email, labelX, pageW - margin * 2, helvetica, 10);

  // Footer
  y -= 8;
  page.drawText(`Footprint Technologies  ·  info@footprintnavigator.com  ·  footprintnavigator.com`, {
    x: margin, y, font: helvetica, size: 8, color: rgb(0.6, 0.6, 0.6),
  });

  return doc.save();
}

// ── GET /nda-prefill?email=... ────────────────────────────────────────────────
router.get("/nda-prefill", async (req, res) => {
  const email = (req.query["email"] as string | undefined)?.trim() ?? "";
  if (!email) {
    res.json({ name: "", company: "" });
    return;
  }
  try {
    const result = await lookupCustomerByEmail(email);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "nda-prefill lookup failed");
    res.json({ name: "", company: "" });
  }
});

// ── POST /nda-sign ────────────────────────────────────────────────────────────
router.post("/nda-sign", async (req, res) => {
  const { signerName, company, title, email, signatureText } = req.body as {
    signerName?: string;
    company?: string;
    title?: string;
    email?: string;
    signatureText?: string;
  };

  if (!signerName?.trim() || !company?.trim() || !email?.trim() || !signatureText?.trim()) {
    res.status(400).json({ ok: false, error: "Signature, Name, Company, and Email are required" });
    return;
  }

  const signedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const ndaDate = new Date().toISOString();

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await buildSignedPdf({
      signerName: signerName.trim(),
      company: company.trim(),
      title: title?.trim() ?? "",
      email: email.trim(),
      signatureText: signatureText.trim(),
      signedDate,
    });
  } catch (err) {
    req.log.error({ err }, "PDF generation failed");
    res.status(500).json({ ok: false, error: "Failed to generate signed document. Please try again." });
    return;
  }

  // Update NDA Date in Google Sheet (non-blocking)
  updateNdaDate(email.trim(), ndaDate).catch((err: unknown) => {
    req.log.error({ err }, "NDA date sheet update failed (non-fatal)");
  });

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    req.log.warn("RESEND_API_KEY not set — NDA signed but no emails sent");
    res.json({ ok: true });
    return;
  }

  const resend = new Resend(apiKey);
  const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

  // Email to signer
  resend.emails.send({
    from: "Footprint Navigator <info@footprintnavigator.com>",
    to: email.trim(),
    subject: "Your Signed Confidentiality Agreement - Footprint Technologies",
    html: `
      <div style="font-family: Arial, sans-serif; background: #000; color: #fff; padding: 40px; max-width: 600px; margin: 0 auto;">
        <p style="margin: 0 0 28px 0; font-size: 13px; font-weight: 700; letter-spacing: 3px; color: #007BFF; text-transform: uppercase;">FOOTPRINT TECHNOLOGIES</p>
        <p style="font-size: 16px; line-height: 1.6; color: #ccc; margin: 0 0 16px 0;">Hi ${signerName},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #ccc; margin: 0 0 16px 0;">Your signed Confidentiality Acknowledgment is attached to this email for your records.</p>
        <p style="font-size: 14px; color: #888; margin: 0 0 32px 0;">Signed: ${signedDate}</p>
        <p style="font-size: 16px; line-height: 1.6; color: #ccc; margin: 0 0 32px 0;">Reply to this email with any questions.</p>
        <hr style="border: none; border-top: 1px solid #333; margin: 0 0 24px 0;" />
        <p style="font-size: 12px; color: #666; margin: 0;">Footprint Technologies &middot; info@footprintnavigator.com</p>
      </div>
    `,
    attachments: [{ filename: "Footprint-Technologies-Confidentiality-Agreement-Signed.pdf", content: pdfBase64 }],
  }).catch((err: unknown) => req.log.error({ err }, "NDA signer email failed"));

  // Email to internal team
  resend.emails.send({
    from: "Footprint Navigator <info@footprintnavigator.com>",
    to: "info@footprintnavigator.com",
    subject: `Signed NDA: ${signerName} - ${company}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px;">
        <h2 style="margin-top: 0; color: #007BFF;">NDA Signed</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px 16px 8px 0; font-weight: bold; color: #555; white-space: nowrap;">Name:</td><td>${signerName}</td></tr>
          <tr><td style="padding: 8px 16px 8px 0; font-weight: bold; color: #555; white-space: nowrap;">Company:</td><td>${company}</td></tr>
          <tr><td style="padding: 8px 16px 8px 0; font-weight: bold; color: #555; white-space: nowrap;">Title:</td><td>${title || "—"}</td></tr>
          <tr><td style="padding: 8px 16px 8px 0; font-weight: bold; color: #555; white-space: nowrap;">Email:</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 8px 16px 8px 0; font-weight: bold; color: #555; white-space: nowrap;">Date:</td><td>${signedDate}</td></tr>
        </table>
      </div>
    `,
    attachments: [{ filename: "Footprint-Technologies-Confidentiality-Agreement-Signed.pdf", content: pdfBase64 }],
  }).catch((err: unknown) => req.log.error({ err }, "NDA internal email failed"));

  res.json({ ok: true });
});

export default router;
