import { Router, type IRouter } from "express";
import { Resend } from "resend";
import crypto from "crypto";

const router: IRouter = Router();

interface TokenData {
  firstName: string;
  lastName: string;
  email: string;
  expiresAt: number;
}

const demoTokens = new Map<string, TokenData>();

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
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  demoTokens.set(token, { firstName, lastName, email, expiresAt });

  const domains = process.env["REPLIT_DOMAINS"]?.split(",")[0];
  const baseUrl = domains ? `https://${domains}` : "https://footprintnavigator.com";
  const demoLink = `${baseUrl}/demo/access?token=${token}`;

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    req.log.warn("RESEND_API_KEY not set — skipping email, token stored in memory");
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
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Demo Request</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Token:</strong> ${token}</p>
          <p><strong>Expires:</strong> ${new Date(expiresAt).toLocaleDateString()}</p>
          <p><strong>Demo Link:</strong> <a href="${demoLink}">${demoLink}</a></p>
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

  if (!token || !demoTokens.has(token)) {
    res.status(401).json({ valid: false, error: "Invalid or expired link" });
    return;
  }

  const tokenData = demoTokens.get(token)!;

  if (Date.now() > tokenData.expiresAt) {
    demoTokens.delete(token);
    res.status(401).json({ valid: false, error: "This link has expired" });
    return;
  }

  res.json({
    valid: true,
    firstName: tokenData.firstName,
    appUrl: "https://footprintnavigator.com/app",
  });
});

export default router;
