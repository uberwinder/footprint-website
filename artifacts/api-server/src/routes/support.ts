import { Router, type IRouter } from "express";
import { Resend } from "resend";

const router: IRouter = Router();

router.post("/support-ticket", async (req, res) => {
  const { firstName, lastName, email, subject, description, category } = req.body as {
    firstName?: string;
    lastName?: string;
    email?: string;
    subject?: string;
    description?: string;
    category?: string;
  };

  if (!firstName || !lastName || !email || !subject || !description || !category) {
    res.status(400).json({ ok: false, error: "All fields required" });
    return;
  }

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    req.log.warn("RESEND_API_KEY not set — skipping support ticket email");
    res.json({ ok: true });
    return;
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: "Footprint Navigator <info@footprintnavigator.com>",
      to: "info@footprintnavigator.com",
      subject: `Support Ticket [${category}]: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px;">
          <h2 style="margin-top: 0; color: #007BFF;">New Support Ticket</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <td style="padding: 8px 16px 8px 0; font-weight: bold; white-space: nowrap; vertical-align: top;">Name:</td>
              <td style="padding: 8px 0;">${firstName} ${lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 16px 8px 0; font-weight: bold; white-space: nowrap; vertical-align: top;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 16px 8px 0; font-weight: bold; white-space: nowrap; vertical-align: top;">Category:</td>
              <td style="padding: 8px 0;">${category}</td>
            </tr>
            <tr>
              <td style="padding: 8px 16px 8px 0; font-weight: bold; white-space: nowrap; vertical-align: top;">Subject:</td>
              <td style="padding: 8px 0;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 16px 8px 0; font-weight: bold; white-space: nowrap; vertical-align: top; border-top: 1px solid #eee;">Description:</td>
              <td style="padding: 8px 0; border-top: 1px solid #eee; white-space: pre-wrap;">${description}</td>
            </tr>
          </table>
        </div>
      `,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to send support ticket email");
  }

  res.json({ ok: true });
});

export default router;
