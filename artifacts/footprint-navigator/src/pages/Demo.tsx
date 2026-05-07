import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const logoSrc = "/FootprintLogo.png";

export default function Demo() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState("");
  const [showWakingUp, setShowWakingUp] = useState(false);

  const wakingUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function clearTimers() {
    if (wakingUpTimerRef.current) { clearTimeout(wakingUpTimerRef.current); wakingUpTimerRef.current = null; }
    if (timeoutTimerRef.current) { clearTimeout(timeoutTimerRef.current); timeoutTimerRef.current = null; }
  }

  useEffect(() => {
    return () => {
      clearTimers();
      abortRef.current?.abort();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setShowWakingUp(false);
    setIsSubmitting(true);

    const submitStartTime = Date.now();
    abortRef.current = new AbortController();

    wakingUpTimerRef.current = setTimeout(() => {
      setShowWakingUp(true);
    }, 5000);

    timeoutTimerRef.current = setTimeout(() => {
      abortRef.current?.abort();
      clearTimers();
      setShowWakingUp(false);
      setIsSubmitting(false);
      setError("Something went wrong. Please try again or contact us at info@footprintnavigator.com");
    }, 90000);

    try {
      const res = await fetch("https://footprint-api.onrender.com/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
        signal: abortRef.current.signal,
      });

      const data = await res.json() as { success?: boolean; error?: string };

      clearTimers();
      setShowWakingUp(false);

      if (!res.ok || !data.success) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSubmittedEmail(email);
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      clearTimers();
      setShowWakingUp(false);
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      const elapsed = Date.now() - submitStartTime;
      if (elapsed < 3000) {
        setError("Unable to connect. Please try again in a moment — if this keeps happening contact us at info@footprintnavigator.com");
      } else {
        setError("Something went wrong. Please try again or contact us at info@footprintnavigator.com");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background items-center justify-center p-8">
      <div className="w-full" style={{ maxWidth: "480px", margin: "0 auto" }}>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <img
              src={logoSrc}
              alt="Footprint Navigator"
              style={{ height: "64px", width: "auto", margin: "0 auto 24px" }}
            />
            <p className="text-xl font-semibold leading-relaxed" style={{ color: "hsl(var(--primary))" }}>
              Check your email! We sent a demo link to{" "}
              <span className="font-bold">{submittedEmail}</span>. It expires in 7 days.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="mb-10">
              <h1 className="text-3xl font-bold mb-4">Request Demo Access</h1>
              <p className="text-muted-foreground leading-relaxed">
                Footprint Navigator launches July 1, 2026. Request access below and we'll send you a personal demo link instantly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    placeholder="Smith"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Work Email</label>
                <Input
                  type="email"
                  placeholder="jane@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : <>Get Demo Access <ChevronRight className="ml-2" size={18} /></>}
              </Button>

              {isSubmitting && showWakingUp && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-muted-foreground text-center leading-relaxed"
                >
                  Almost there — our server is waking up. This can take up to 30 seconds on first request.
                </motion.p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
