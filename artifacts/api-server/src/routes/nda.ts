import { Router, type IRouter } from "express";
import { Resend } from "resend";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { updateNdaDate } from "../lib/sheets.js";

const router: IRouter = Router();

async function buildSignedPdf(name: string, email: string, signedAt: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const addPage = () => {
    const p = doc.addPage([612, 792]); // US Letter
    return p;
  };

  const page = addPage();
  const { width, height } = page.getSize();
  const margin = 72;
  let y = height - margin;

  const drawText = (text: string, opts: {
    size?: number; bold?: boolean; color?: [number, number, number]; indent?: number; lineHeight?: number;
  } = {}) => {
    const { size = 11, bold = false, color = [0, 0, 0], indent = 0, lineHeight = 1.5 } = opts;
    const usedFont = bold ? boldFont : font;
    const maxWidth = width - margin * 2 - indent;
    const words = text.split(" ");
    let line = "";

    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      const testWidth = usedFont.widthOfTextAtSize(test, size);
      if (testWidth > maxWidth && line) {
        page.drawText(line, { x: margin + indent, y, font: usedFont, size, color: rgb(...(color as [number, number, number])) });
        y -= size * lineHeight;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      page.drawText(line, { x: margin + indent, y, font: usedFont, size, color: rgb(...(color as [number, number, number])) });
      y -= size * lineHeight;
    }
  };

  const gap = (px = 12) => { y -= px; };

  // Header
  drawText("FOOTPRINT TECHNOLOGIES", { size: 10, bold: true, color: [0, 0.48, 1] });
  gap(4);
  drawText("Non-Disclosure Agreement — Signed Copy", { size: 16, bold: true });
  gap(16);

  // Signature confirmation block
  drawText("ELECTRONIC SIGNATURE CONFIRMATION", { size: 9, bold: true, color: [0.4, 0.4, 0.4] });
  gap(8);

  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  gap(12);

  drawText(`Signer Name:`, { size: 10, bold: true });
  drawText(name, { size: 13, indent: 8 });
  gap(6);

  drawText(`Signer Email:`, { size: 10, bold: true });
  drawText(email, { size: 11, indent: 8 });
  gap(6);

  drawText(`Date and Time Signed:`, { size: 10, bold: true });
  drawText(signedAt, { size: 11, indent: 8 });
  gap(16);

  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  gap(16);

  drawText(
    `By signing this document electronically, ${name} (${email}) confirms that they have read, understood, and agree to be legally bound by the Non-Disclosure Agreement issued by Footprint Technologies. This electronic signature carries the same legal weight as a handwritten signature.`,
    { size: 11, lineHeight: 1.6 }
  );
  gap(20);

  drawText("AGREEMENT TERMS SUMMARY", { size: 9, bold: true, color: [0.4, 0.4, 0.4] });
  gap(10);

  const terms = [
    "Confidential Information: All non-public technical, business, financial, and product information disclosed by Footprint Technologies.",
    "Obligations: The receiving party agrees to hold all Confidential Information in strict confidence and not to disclose it to any third party without prior written consent.",
    "Permitted Use: Confidential Information may only be used for evaluating or participating in the Footprint Navigator early access program.",
    "Duration: Obligations remain in effect for three (3) years from the date of signing.",
    "Exclusions: Information that is publicly available, independently developed, or legally obtained from a third party is excluded.",
    "Return of Information: Upon request, all Confidential Information and copies thereof must be returned or destroyed.",
    "Governing Law: This Agreement is governed by the laws of the applicable jurisdiction.",
  ];

  for (const term of terms) {
    const [label, ...rest] = term.split(": ");
    drawText(`${label}:`, { size: 10, bold: true });
    drawText(rest.join(": "), { size: 10, indent: 8, lineHeight: 1.5 });
    gap(6);
  }

  gap(16);
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  gap(12);

  drawText("Signature", { size: 9, bold: true, color: [0.4, 0.4, 0.4] });
  gap(4);
  drawText(name, { size: 22, bold: false, color: [0.1, 0.1, 0.1] });
  gap(4);
  page.drawLine({ start: { x: margin, y }, end: { x: margin + 260, y }, thickness: 0.8, color: rgb(0.3, 0.3, 0.3) });
  gap(6);
  drawText(signedAt, { size: 9, color: [0.5, 0.5, 0.5] });
  gap(20);

  drawText("Footprint Technologies · info@footprintnavigator.com · footprintnavigator.com", { size: 9, color: [0.6, 0.6, 0.6] });

  return doc.save();
}

router.post("/nda-sign", async (req, res) => {
  const { name, email } = req.body as { name?: string; email?: string };

  if (!name?.trim() || !email?.trim()) {
    res.status(400).json({ ok: false, error: "Name and email are required" });
    return;
  }

  const signedAt = new Date().toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long",
    day: "numeric", hour: "2-digit", minute: "2-digit",
    second: "2-digit", timeZoneName: "short",
  });
  const ndaDate = new Date().toISOString();

  // Generate signed PDF
  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await buildSignedPdf(name.trim(), email.trim(), signedAt);
  } catch (err) {
    req.log.error({ err }, "Failed to generate signed PDF");
    res.status(500).json({ ok: false, error: "Failed to generate signed document" });
    return;
  }

  // Update NDA Date in Google Sheet (fire-and-forget)
  updateNdaDate(email.trim(), ndaDate).catch((err: unknown) => {
    req.log.error({ err }, "Failed to update NDA date in sheet (non-fatal)");
  });

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    req.log.warn("RESEND_API_KEY not set — skipping NDA emails");
    res.json({ ok: true });
    return;
  }

  const resend = new Resend(apiKey);
  const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

  // Email signed PDF to signer
  resend.emails.send({
    from: "Footprint Navigator <info@footprintnavigator.com>",
    to: email.trim(),
    subject: "Your Signed Non-Disclosure Agreement — Footprint Navigator",
    html: `
      <div style="font-family: Arial, sans-serif; background: #000; color: #fff; padding: 40px; max-width: 600px; margin: 0 auto;">
        <p style="margin: 0 0 32px 0; font-size: 13px; font-weight: 700; letter-spacing: 3px; color: #007BFF; text-transform: uppercase;">FOOTPRINT NAVIGATOR</p>
        <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #cccccc;">Hi ${name},</p>
        <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #cccccc;">Your signed Non-Disclosure Agreement is attached to this email for your records.</p>
        <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #cccccc;">Signed: ${signedAt}</p>
        <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #cccccc;">Reply to this email with any questions.</p>
        <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;" />
        <p style="margin: 0; font-size: 12px; color: #666;">Footprint Technologies · info@footprintnavigator.com</p>
      </div>
    `,
    attachments: [{
      filename: "Footprint-Navigator-NDA-Signed.pdf",
      content: pdfBase64,
    }],
  }).catch((err: unknown) => {
    req.log.error({ err }, "Signed NDA email to signer failed (non-fatal)");
  });

  // Notification to internal team
  resend.emails.send({
    from: "Footprint Navigator <info@footprintnavigator.com>",
    to: "info@footprintnavigator.com",
    subject: `NDA Signed: ${name} — ${email}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px;">
        <h2 style="margin-top: 0; color: #007BFF;">NDA Signed</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px 16px 8px 0; font-weight: bold; color: #555; white-space: nowrap;">Name:</td><td style="padding: 8px 0;">${name}</td></tr>
          <tr><td style="padding: 8px 16px 8px 0; font-weight: bold; color: #555; white-space: nowrap;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 8px 16px 8px 0; font-weight: bold; color: #555; white-space: nowrap;">Signed At:</td><td style="padding: 8px 0;">${signedAt}</td></tr>
        </table>
      </div>
    `,
    attachments: [{
      filename: "Footprint-Navigator-NDA-Signed.pdf",
      content: pdfBase64,
    }],
  }).catch((err: unknown) => {
    req.log.error({ err }, "NDA notification email failed (non-fatal)");
  });

  res.json({ ok: true });
});

export default router;
