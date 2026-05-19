import { useState, useRef, useCallback } from "react";
import { useSearch } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SampleFiles() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const email = params.get("email") ?? "";

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateAndSet(f: File) {
    if (f.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }
    setError("");
    setFile(f);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) validateAndSet(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError("");
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const url = `https://footprint-api.onrender.com/api/upload${email ? `?email=${encodeURIComponent(email)}` : ""}`;
      const res = await fetch(url, { method: "POST", body: form });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Upload failed. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero */}
      <section className="relative w-full py-14 md:py-20 overflow-hidden bg-background border-b border-border/40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 h-[200px] w-[200px] rounded-full bg-primary opacity-20 blur-[100px]" />
        <div className="container relative z-10 mx-auto px-4 md:px-8 text-center max-w-2xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-bold tracking-widest text-primary uppercase mb-4"
          >
            Early Access Program
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4"
          >
            Upload Sample Files
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Share a sample project file to help us build features specific to your workflow.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 max-w-xl py-16">
        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/50 rounded-2xl p-10 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007BFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="text-xl font-bold mb-3">Files Received</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your files have been received. Thank you.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-border/50 rounded-2xl p-8">
            <h2 className="text-lg font-bold mb-2">Upload a Project File</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              PDF files only. Maximum file size 50 MB.
            </p>

            {/* Drop zone */}
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => inputRef.current?.click()}
              className={`
                relative cursor-pointer rounded-xl border-2 border-dashed transition-colors duration-150
                flex flex-col items-center justify-center gap-3 p-10 mb-6 select-none
                ${isDragging
                  ? "border-primary bg-primary/5"
                  : file
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/60 hover:border-border bg-background"
                }
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={onFileChange}
              />

              {file ? (
                <>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(file.size)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Click to choose a different file</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <polyline points="16 16 12 12 8 16"/>
                      <line x1="12" y1="12" x2="12" y2="21"/>
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      {isDragging ? "Drop your file here" : "Drag and drop your PDF here"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                  </div>
                </>
              )}
            </div>

            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={!file || isUploading}
            >
              {isUploading ? "Uploading..." : "Submit"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
