import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NDA_SECTIONS = [
  {
    heading: "1. PURPOSE",
    body: 'The Company is providing Recipient with access to proprietary software, product information, technical data, and business information related to Footprint Navigator, an AI-powered document navigation platform developed for the construction industry (the "Purpose"). In connection with the Purpose, the Company may disclose Confidential Information as defined below.',
  },
  {
    heading: "2. DEFINITION OF CONFIDENTIAL INFORMATION",
    body: '"Confidential Information" means any and all information or data that has or could have commercial value or other utility in the business in which Company is engaged, including but not limited to: software source code, product designs, algorithms, technical specifications, user interfaces, business strategies, customer data, financial projections, research and development activities, and any other information the Company designates as confidential or that, under the circumstances of disclosure, would reasonably be understood to be confidential.',
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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}{required && <span className="text-primary ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function Nda() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const emailParam = params.get("email") ?? "";

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const [signature, setSignature] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState(emailParam);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successEmail, setSuccessEmail] = useState("");
  const [loadingPrefill, setLoadingPrefill] = useState(false);

  // Pre-fill name and company from API if email param present
  useEffect(() => {
    if (!emailParam) return;
    setLoadingPrefill(true);
    fetch(`https://footprint-api.onrender.com/api/nda-prefill?email=${encodeURIComponent(emailParam)}`)
      .then((r) => r.json())
      .then((data: { name?: string; company?: string }) => {
        if (data.name) setName(data.name);
        if (data.company) setCompany(data.company);
      })
      .catch(() => {})
      .finally(() => setLoadingPrefill(false));
  }, [emailParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signature.trim() || !name.trim() || !company.trim() || !email.trim()) return;
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("https://footprint-api.onrender.com/api/nda-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureText: signature.trim(),
          signerName: name.trim(),
          company: company.trim(),
          title: title.trim(),
          email: email.trim(),
        }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSuccessEmail(email.trim());
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit = signature.trim() && name.trim() && company.trim() && email.trim();

  if (successEmail) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full bg-card border border-border/50 rounded-2xl p-10 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Agreement Signed</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your signed agreement has been sent to{" "}
            <span className="text-foreground font-medium">{successEmail}</span>.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" />

      {/* Hero */}
      <section className="relative w-full py-14 md:py-20 overflow-hidden bg-background border-b border-border/40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 h-[200px] w-[200px] rounded-full bg-primary opacity-20 blur-[100px]" />
        <div className="container relative z-10 mx-auto px-4 md:px-8 text-center max-w-3xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-bold tracking-widest text-primary uppercase mb-4"
          >
            Footprint Technologies
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4"
          >
            Confidentiality Acknowledgment
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Please read the full agreement below, then complete and sign the signature block.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 max-w-3xl py-12 space-y-0">

        {/* NDA Document body */}
        <div className="bg-card border border-border/50 rounded-t-2xl px-8 md:px-12 py-10">
          {/* Agreement header */}
          <div className="mb-8 pb-6 border-b border-border/40">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">
              Footprint Technologies, Inc.
            </p>
            <h2 className="text-2xl font-bold text-white mb-4">
              Confidentiality Acknowledgment
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              This Confidentiality Acknowledgment (&ldquo;Agreement&rdquo;) is entered into as of the date signed below,
              by and between <span className="text-foreground font-medium">Footprint Technologies, Inc.</span> (&ldquo;Company&rdquo;)
              and the undersigned individual or entity (&ldquo;Recipient&rdquo;).
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-7">
            {NDA_SECTIONS.map((s) => (
              <div key={s.heading}>
                <h3 className="text-sm font-bold text-white mb-2">{s.heading}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{s.body}</p>
              </div>
            ))}
          </div>

          {/* Acknowledgment statement */}
          <div className="mt-10 pt-8 border-t border-border/40">
            <p className="text-sm text-muted-foreground leading-relaxed">
              By signing below, Recipient acknowledges that they have read, understood, and agree to be legally
              bound by all terms of this Confidentiality Acknowledgment. This electronic signature carries the
              same legal force as a handwritten signature.
            </p>
          </div>
        </div>

        {/* Signature block — seamlessly attached to the document */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-t-0 border-border/50 rounded-b-2xl px-8 md:px-12 py-10"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">
            Signature Block
          </h3>

          {loadingPrefill && (
            <p className="text-xs text-muted-foreground mb-6">Loading your information...</p>
          )}

          {/* Signature input + live preview */}
          <div className="mb-8">
            <Field label="Signature" required>
              <Input
                type="text"
                placeholder="Type your full name to sign"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="bg-background text-base"
                required
              />
            </Field>
            {/* Live cursive preview */}
            <div className="mt-3 rounded-lg border border-border/50 bg-background px-5 py-4 min-h-[72px] flex flex-col justify-end">
              <div
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: "38px",
                  color: signature ? "#ffffff" : "#3a3a3a",
                  lineHeight: 1.2,
                  minHeight: "48px",
                  transition: "color 0.1s",
                  userSelect: "none",
                }}
              >
                {signature || "Signature preview"}
              </div>
              <div className="mt-1 pt-2 border-t border-border/40">
                <span className="text-xs text-muted-foreground">Signed electronically</span>
              </div>
            </div>
          </div>

          {/* 2-column: Name + Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <Field label="Name" required>
              <Input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background"
                required
              />
            </Field>
            <Field label="Company" required>
              <Input
                type="text"
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="bg-background"
                required
              />
            </Field>
          </div>

          {/* 2-column: Title + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <Field label="Title">
              <Input
                type="text"
                placeholder="e.g. Project Manager"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background"
              />
            </Field>
            <Field label="Date">
              <Input
                type="text"
                value={today}
                readOnly
                className="bg-background opacity-60 cursor-not-allowed select-none"
                tabIndex={-1}
              />
            </Field>
          </div>

          {/* Email full width */}
          <div className="mb-8">
            <Field label="Email" required>
              <Input
                type="email"
                placeholder="your@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
                required
              />
            </Field>
          </div>

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting ? "Signing..." : "Sign and Submit"}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
            By clicking Sign and Submit you are electronically signing this agreement.
            A PDF copy will be emailed to you immediately.
          </p>
        </form>
      </div>
    </div>
  );
}
