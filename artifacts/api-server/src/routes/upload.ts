import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

// Ensure uploads directory exists relative to where the server runs
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const email = (req.query["email"] as string | undefined)?.trim() ?? "";
    const safeEmail = email ? email.replace(/[^a-zA-Z0-9._@-]/g, "_") : "";
    const prefix = safeEmail ? `${safeEmail}_` : "";
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || ".pdf";
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${prefix}${timestamp}_${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted."));
    }
  },
});

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ ok: false, error: "No file received." });
    return;
  }
  req.log.info(
    { filename: req.file.filename, size: req.file.size, email: req.query["email"] },
    "File uploaded",
  );
  res.json({ ok: true });
});

// Multer error handler
router.use(
  "/upload",
  (err: unknown, _req: import("express").Request, res: import("express").Response, _next: import("express").NextFunction) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ ok: false, error: err.message });
    } else if (err instanceof Error) {
      res.status(400).json({ ok: false, error: err.message });
    } else {
      res.status(500).json({ ok: false, error: "Upload failed." });
    }
  },
);

export default router;
