import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
const logoSrc = "/FootprintLogo.png";

type Status = "loading" | "valid" | "invalid";

interface AccessResponse {
  valid: boolean;
  firstName?: string;
  appUrl?: string;
  error?: string;
}

export default function DemoAccess() {
  const [status, setStatus] = useState<Status>("loading");
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("invalid");
      return;
    }

    fetch(`https://footprint-api.onrender.com/api/demo-access?token=${encodeURIComponent(token)}`)
      .then((r) => r.json() as Promise<AccessResponse>)
      .then((data) => {
        if (data.valid && data.firstName) {
          setFirstName(data.firstName);
          setStatus("valid");
          setTimeout(() => {
            window.location.href = data.appUrl ?? "https://footprintnavigator.com/app";
          }, 2000);
        } else {
          setStatus("invalid");
        }
      })
      .catch(() => setStatus("invalid"));
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background items-center justify-center p-8">
      <div className="w-full text-center" style={{ maxWidth: "480px", margin: "0 auto" }}>
        <img
          src={logoSrc}
          alt="Footprint Navigator"
          style={{ height: "64px", width: "auto", margin: "0 auto 32px" }}
        />

        {status === "loading" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Loader2
              className="animate-spin mx-auto mb-6"
              size={40}
              style={{ color: "hsl(var(--primary))" }}
            />
            <p className="text-muted-foreground">Verifying your demo link…</p>
          </motion.div>
        )}

        {status === "valid" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h1 className="text-2xl font-bold mb-4">
              Welcome, <span style={{ color: "hsl(var(--primary))" }}>{firstName}!</span>
            </h1>
            <p className="text-muted-foreground mb-6">Launching Footprint Navigator…</p>
            <Loader2
              className="animate-spin mx-auto"
              size={32}
              style={{ color: "hsl(var(--primary))" }}
            />
          </motion.div>
        )}

        {status === "invalid" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h1 className="text-2xl font-bold mb-4">Link Invalid or Expired</h1>
            <p className="text-muted-foreground mb-8">
              This demo link is invalid or has expired. Request a new one below.
            </p>
            <Button asChild>
              <Link href="/demo">Request a New Demo Link</Link>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
