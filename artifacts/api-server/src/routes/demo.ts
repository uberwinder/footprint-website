import { Router, type IRouter } from "express";
import { Resend } from "resend";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db, demoTokensTable } from "@workspace/db";
import { appendDemoRequestRow } from "../lib/sheets.js";

const router: IRouter = Router();

const ADMIN_KEY = "FootprintAdmin2026";

router.post("/demo-request", async (req, res) => {
  const { firstName, lastName, email } = req.body as {
    firstName?: string;
    lastName?: string;
    email?: string;
  };

  if (!firstName || !lastName || !email) {
    res.status(400).json({ error: "All fields required" });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Persist token to PostgreSQL
  try {
    await db.insert(demoTokensTable).values({
      token,
      email,
      firstName,
      lastName,
      expiresAt,
      used: false,
      appAccessed: false,
    });
  } catch (dbErr: unknown) {
    req.log.error({ dbErr }, "Failed to insert demo token into database");
    res.status(500).json({ error: "Unable to process request. Please try again." });
    return;
  }

  // Fire-and-forget: append to Google Sheets (never blocks the response)
  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
    req.socket.remoteAddress ??
    "";
  appendDemoRequestRow({
    submittedAt: createdAt.toISOString(),
    firstName,
    lastName,
    email,
    token,
    expiresAt: expiresAt.toISOString(),
    ip,
  }).catch((err: unknown) => {
    req.log.error({ err }, "Google Sheets write failed (non-fatal)");
  });

  const domains = process.env["REPLIT_DOMAINS"]?.split(",")[0];
  const baseUrl = domains ? `https://${domains}` : "https://footprintnavigator.com";
  const demoLink = `${baseUrl}/demo/access?token=${token}`;

  const requestedAtFormatted = createdAt.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const expiresFormatted = expiresAt.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    req.log.warn("RESEND_API_KEY not set — skipping email, token saved to database");
    res.json({ success: true });
    return;
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: "Footprint Navigator <info@footprintnavigator.com>",
      to: email,
      subject: "Your Footprint Navigator Demo Access",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin:0;padding:0;background:#000000;">
        <div style="font-family: Montserrat, Arial, sans-serif; background: #000000; color: #ffffff; padding: 40px; max-width: 600px; margin: 0 auto;">
          <p style="margin: 0 0 32px 0; font-size: 16px; font-weight: 700; letter-spacing: 3px; color: #007BFF; text-transform: uppercase;">FOOTPRINT NAVIGATOR</p>
          <h1 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.2;">Tread boldly, ${firstName}.</h1>
          <p style="margin: 0 0 28px 0; font-size: 16px; line-height: 1.6; color: #cccccc;">Your demo access to Footprint Navigator is ready. Launching July 1, 2026 — early users who help us test may receive free access and lifetime discounts.</p>
          <a href="${demoLink}" style="display: inline-block; background: #007BFF; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: 700; margin-bottom: 28px;">Launch Demo</a>
          <p style="margin: 0 0 0 0; font-size: 13px; color: #888888;">This link expires in 7 days. Do not share it.</p>
          <hr style="border: none; border-top: 1px solid #333333; margin: 32px 0;" />
          <p style="margin: 0; font-size: 12px; color: #666666;">© 2026 Footprint Technologies · info@footprintnavigator.com</p>
        </div>
        </body>
        </html>
      `,
    });

    await resend.emails.send({
      from: "Footprint Navigator <info@footprintnavigator.com>",
      to: "info@footprintnavigator.com",
      subject: `New Demo Request: ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px;">
          <h2 style="margin-top: 0; color: #007BFF;">New Demo Request</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <td style="padding: 8px 16px 8px 0; font-weight: bold; white-space: nowrap; vertical-align: top;">First Name:</td>
              <td style="padding: 8px 0;">${firstName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 16px 8px 0; font-weight: bold; white-space: nowrap; vertical-align: top;">Last Name:</td>
              <td style="padding: 8px 0;">${lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 16px 8px 0; font-weight: bold; white-space: nowrap; vertical-align: top;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 16px 8px 0; font-weight: bold; white-space: nowrap; vertical-align: top;">Requested:</td>
              <td style="padding: 8px 0;">${requestedAtFormatted}</td>
            </tr>
            <tr>
              <td style="padding: 8px 16px 8px 0; font-weight: bold; white-space: nowrap; vertical-align: top;">Token Expires:</td>
              <td style="padding: 8px 0;">${expiresFormatted}</td>
            </tr>
            <tr>
              <td style="padding: 8px 16px 8px 0; font-weight: bold; white-space: nowrap; vertical-align: top;">Demo Link:</td>
              <td style="padding: 8px 0; word-break: break-all;"><a href="${demoLink}">${demoLink}</a></td>
            </tr>
          </table>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to send demo email");
    res.status(500).json({ error: "Failed to send email" });
  }
});

router.get("/demo-access", async (req, res) => {
  const token = req.query["token"] as string | undefined;

  if (!token) {
    res.status(401).json({ valid: false, error: "Invalid or expired link" });
    return;
  }

  let rows;
  try {
    rows = await db
      .select()
      .from(demoTokensTable)
      .where(eq(demoTokensTable.token, token))
      .limit(1);
  } catch (dbErr: unknown) {
    req.log.error({ dbErr }, "Failed to query demo token from database");
    res.status(500).json({ valid: false, error: "Unable to process request. Please try again." });
    return;
  }

  if (rows.length === 0) {
    res.status(401).json({ valid: false, error: "Invalid or expired link" });
    return;
  }

  const record = rows[0];

  if (Date.now() > new Date(record.expiresAt).getTime()) {
    res.status(401).json({ valid: false, error: "This link has expired" });
    return;
  }

  try {
    await db
      .update(demoTokensTable)
      .set({ appAccessed: true })
      .where(eq(demoTokensTable.token, token));
  } catch (dbErr: unknown) {
    req.log.error({ dbErr }, "Failed to mark token as accessed (non-fatal)");
  }

  res.json({
    valid: true,
    firstName: record.firstName,
    appUrl: "https://footprint-app-30jy.onrender.com",
  });
});

router.get("/admin/requests", async (req, res) => {
  const key = req.query["key"] as string | undefined;

  if (key !== ADMIN_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(demoTokensTable)
      .orderBy(demoTokensTable.createdAt);
    res.json(rows);
  } catch (dbErr: unknown) {
    req.log.error({ dbErr }, "Failed to query demo tokens from database");
    res.status(500).json({ error: "Unable to process request. Please try again." });
  }
});

export default router;
