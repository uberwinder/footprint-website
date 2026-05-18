import { Router, type IRouter } from "express";
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

  // Fire-and-forget — never blocks the response
  appendTrialCustomerRow({
    name,
    company,
    email,
    role,
    phone: phone ?? "",
    companySize,
    earlyAccess,
  }).catch((err: unknown) => {
    req.log.error({ err }, "Google Sheets signup write failed (non-fatal)");
  });

  res.json({ ok: true });
});

router.get("/trial-count", async (req, res) => {
  try {
    const count = await getTrialCustomerCount();
    res.json({ count });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch trial customer count");
    res.json({ count: 0 });
  }
});

export default router;
