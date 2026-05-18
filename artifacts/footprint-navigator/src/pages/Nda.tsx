import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Nda() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const update = () => {
      setTimestamp(new Date().toLocaleString("en-US", {
        weekday: "long", year: "numeric", month: "long",
        day: "numeric", hour: "2-digit", minute: "2-digit",
        second: "2-digit", timeZoneName: "short",
      }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("https://footprint-api.onrender.com/api/nda-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setIsSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap"
      />

      {/* Hero */}
      <section className="relative w-full py-16 md:py-20 overflow-hidden bg-background border-b border-border/40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 h-[200px] w-[200px] rounded-full bg-primary opacity-20 blur-[100px]" />
        <div className="container relative z-10 mx-auto px-4 md:px-8 text-center max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4"
          >
            Confidentiality Agreement
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Please read the full agreement below and sign with your full name.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 max-w-4xl py-12 space-y-12">

        {/* NDA Document */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Non-Disclosure Agreement
            </h2>
          </div>
          <div className="w-full" style={{ height: "600px" }}>
            <iframe
              src="/nda.pdf"
              className="w-full h-full border-0"
              title="Footprint Navigator Non-Disclosure Agreement"
            />
          </div>
        </div>

        {/* Signature Section */}
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-primary/30 rounded-2xl p-10 text-center"
          >
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-primary" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-3">Agreement Signed</h2>
            <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
              Your signed copy has been emailed to you. Thank you for completing this step.
            </p>
          </motion.div>
        ) : (
          <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-10">
            <h2 className="text-xl font-bold mb-2">Sign this Agreement</h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              By signing below, you confirm that you have read and agree to the terms of the Non-Disclosure Agreement above.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Work Email <span className="text-primary">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Use the same email you signed up with. Your signed copy will be sent here.
                </p>
              </div>

              {/* Name Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Full Name <span className="text-primary">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Type your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>

              {/* Live Signature Preview */}
              <div className="rounded-xl border border-border/60 bg-background p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
                  Signature Preview
                </p>
                <div
                  style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: "42px",
                    color: name ? "#ffffff" : "#444",
                    minHeight: "60px",
                    lineHeight: 1.2,
                    transition: "color 0.15s",
                  }}
                >
                  {name || "Your name will appear here"}
                </div>
                <div className="mt-4 pt-4 border-t border-border/40 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">Date signed:</span>{" "}
                    {timestamp}
                  </p>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isSubmitting || !name.trim() || !email.trim()}
              >
                {isSubmitting ? "Signing…" : "Sign and Submit"}
              </Button>

              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                By clicking Sign and Submit, you are electronically signing this agreement.
                A PDF copy will be emailed to you immediately.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
