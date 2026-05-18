import { Router, type IRouter } from "express";
import { Resend } from "resend";
import { appendTrialCustomerRow, getTrialCustomerCount } from "../lib/sheets.js";

const router: IRouter = Router();

router.post("/signup", async (req, res) => {
  const { name, company, email, role, phone, companySize, earlyAccess } = req.body as {
    name?: string;
    company?: string;
    email?: string;
    role?: string;
    phone?: string;
    companySize?: string;
    earlyAccess?: string;
  };

  if (!name || !company || !email || !role || !companySize || !earlyAccess) {
    res.status(400).json({ ok: false, error: "All required fields must be provided" });
    return;
  }

  // Fire-and-forget sheet write
  appendTrialCustomerRow({
    name, company, email, role,
    phone: phone ?? "",
    companySize,
    earlyAccess,
  }).catch((err: unknown) => {
    req.log.error({ err }, "Google Sheets signup write failed (non-fatal)");
  });

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    req.log.warn("RESEND_API_KEY not set — skipping signup emails");
    res.json({ ok: true });
    return;
  }

  const resend = new Resend(apiKey);

  // Welcome email to the customer
  resend.emails.send({
    from: "Footprint Navigator <info@footprintnavigator.com>",
    to: email,
    subject: "Welcome to Footprint Navigator",
    html: `
      <div style="font-family: Arial, sans-serif; background: #000; color: #fff; padding: 40px; max-width: 600px; margin: 0 auto;">
        <p style="margin: 0 0 32px 0; font-size: 13px; font-weight: 700; letter-spacing: 3px; color: #007BFF; text-transform: uppercase;">FOOTPRINT NAVIGATOR</p>
        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #cccccc;">We are excited to have you tread boldly with us, ${company}.</p>
        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #cccccc;">You are now part of a small group helping shape how the construction industry navigates documents. Your feedback directly influences what we build next.</p>
        <p style="margin: 0 0 28px 0; font-size: 16px; line-height: 1.6; color: #cccccc;">As part of our early access program, please review and sign our confidentiality agreement here: <a href="https://footprintnavigator.com/nda" style="color: #007BFF;">https://footprintnavigator.com/nda</a></p>
        <p style="margin: 0 0 28px 0; font-size: 16px; line-height: 1.6; color: #cccccc;">Reply to this email with any questions. We look forward to working with you.</p>
        <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #cccccc;">The Footprint Team</p>
        <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;" />
        <p style="margin: 0; font-size: 12px; color: #666;">Footprint Technologies · info@footprintnavigator.com</p>
      </div>
    `,
  }).catch((err: unknown) => {
    req.log.error({ err }, "Welcome email failed (non-fatal)");
  });

  // Notification email to internal team
  resend.emails.send({
    from: "Footprint Navigator <info@footprintnavigator.com>",
    to: "info@footprintnavigator.com",
    subject: `New Trial Signup: ${name} - ${company}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px;">
        <h2 style="margin-top: 0; color: #007BFF;">New Trial Signup</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px 16px 8px 0; font-weight: bold; color: #555; white-space: nowrap;">Full Name:</td><td style="padding: 8px 0;">${name}</td></tr>
          <tr><td style="padding: 8px 16px 8px 0; font-weight: bold; color: #555; white-space: nowrap;">Company:</td><td style="padding: 8px 0;">${company}</td></tr>
          <tr><td style="padding: 8px 16px 8px 0; font-weight: bold; color: #555; white-space: nowrap;">Work Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 8px 16px 8px 0; font-weight: bold; color: #555; white-space: nowrap;">Job Role:</td><td style="padding: 8px 0;">${role}</td></tr>
          <tr><td style="padding: 8px 16px 8px 0; font-weight: bold; color: #555; white-space: nowrap;">Phone Number:</td><td style="padding: 8px 0;">${phone || "—"}</td></tr>
          <tr><td style="padding: 8px 16px 8px 0; font-weight: bold; color: #555; white-space: nowrap;">Company Size:</td><td style="padding: 8px 0;">${companySize}</td></tr>
          <tr><td style="padding: 8px 16px 8px 0; font-weight: bold; color: #555; white-space: nowrap;">Early Access:</td><td style="padding: 8px 0;">${earlyAccess}</td></tr>
        </table>
      </div>
    `,
  }).catch((err: unknown) => {
    req.log.error({ err }, "Notification email failed (non-fatal)");
  });

  res.json({ ok: true });
});

router.get("/trial-count", async (req, res) => {
  try {
    const count = await getTrialCustomerCount();
    // Show minimum of 1 even if sheet is empty
    res.json({ count: Math.max(1, count) });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch trial customer count");
    res.json({ count: 1 });
  }
});

export default router;
