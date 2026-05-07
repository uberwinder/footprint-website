import { Router, type IRouter } from "express";
import { Resend } from "resend";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const router: IRouter = Router();

const STORE_PATH = path.resolve("../../demo-requests.json");
const ADMIN_KEY = "FootprintAdmin2026";

interface DemoRequest {
  firstName: string;
  lastName: string;
  email: string;
  token: string;
  requestedAt: string;
  expiresAt: string;
  used: boolean;
  appAccessed: boolean;
}

function readStore(): DemoRequest[] {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      fs.writeFileSync(STORE_PATH, "[]", "utf-8");
    }
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8")) as DemoRequest[];
  } catch {
    return [];
  }
}

function writeStore(requests: DemoRequest[]): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(requests, null, 2), "utf-8");
}

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
  const requestedAt = new Date();
  const expiresAtDate = new Date(requestedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  const record: DemoRequest = {
    firstName,
    lastName,
    email,
    token,
    requestedAt: requestedAt.toISOString(),
    expiresAt: expiresAtDate.toISOString(),
    used: false,
    appAccessed: false,
  };

  const requests = readStore();
  requests.push(record);
  writeStore(requests);

  const domains = process.env["REPLIT_DOMAINS"]?.split(",")[0];
  const baseUrl = domains ? `https://${domains}` : "https://footprintnavigator.com";
  const demoLink = `${baseUrl}/demo/access?token=${token}`;

  const requestedAtFormatted = requestedAt.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const expiresFormatted = expiresAtDate.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    req.log.warn("RESEND_API_KEY not set — skipping email, request saved to file");
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
        <div style="font-family: Arial, sans-serif; background: #000; color: #fff; padding: 40px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #007BFF; margin-top: 30px;">Tread boldly, ${firstName}.</h1>
          <p style="font-size: 16px; line-height: 1.6;">Your demo access to Footprint Navigator is ready. Click the button below to launch the app.</p>
          <a href="${demoLink}" style="display: inline-block; background: #007BFF; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0;">Launch Demo</a>
          <p style="color: #888; font-size: 13px;">This link expires in 7 days. Do not share it.</p>
          <p style="color: #888; font-size: 13px;">Launching July 1, 2026. Early users who help us test get free access and lifetime discounts.</p>
          <hr style="border-color: #333; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px;">© 2026 Footprint Technologies · info@footprintnavigator.com</p>
        </div>
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

router.get("/demo-access", (req, res) => {
  const token = req.query["token"] as string | undefined;

  if (!token) {
    res.status(401).json({ valid: false, error: "Invalid or expired link" });
    return;
  }

  const requests = readStore();
  const idx = requests.findIndex((r) => r.token === token);

  if (idx === -1) {
    res.status(401).json({ valid: false, error: "Invalid or expired link" });
    return;
  }

  const record = requests[idx];

  if (Date.now() > new Date(record.expiresAt).getTime()) {
    res.status(401).json({ valid: false, error: "This link has expired" });
    return;
  }

  requests[idx] = { ...record, appAccessed: true };
  writeStore(requests);

  res.json({
    valid: true,
    firstName: record.firstName,
    appUrl: "https://footprint-app-30jy.onrender.com",
  });
});

router.get("/admin/requests", (req, res) => {
  const key = req.query["key"] as string | undefined;

  if (key !== ADMIN_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const requests = readStore();
  res.json(requests);
});

export default router;
