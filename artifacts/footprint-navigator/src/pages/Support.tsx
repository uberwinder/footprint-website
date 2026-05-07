import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SECTIONS = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: [
      "Upload a PDF or CAD file using the Upload button in the top toolbar.",
      "Once loaded, your document will appear in the main viewport. Use the scroll wheel or pinch gesture to zoom in and out.",
      "The left panel shows your document outline and page navigator. Click any page thumbnail to jump directly to it.",
      "Your session is preserved automatically — documents reload where you left off.",
    ],
  },
  {
    id: "navigating",
    title: "Navigating Your Document",
    content: [
      "Pan by clicking and dragging on the canvas, or use the arrow keys for fine-grained movement.",
      "Zoom with the scroll wheel, the +/− toolbar buttons, or pinch-to-zoom on touch devices.",
      "Use the Fit to Page button (keyboard shortcut: F) to reset the view to the full document.",
      "The minimap in the lower-right corner shows your current viewport position relative to the full document.",
    ],
  },
  {
    id: "searching",
    title: "Searching Your Document",
    content: [
      "Press Ctrl+F (Cmd+F on Mac) to open the search bar, or click the magnifying glass icon in the toolbar.",
      "Type any keyword, room name, or annotation to find matching text across all pages.",
      "Results are highlighted in yellow on the canvas. Use the arrow buttons in the search bar to cycle through matches.",
      "Search supports partial matches and is case-insensitive by default.",
    ],
  },
  {
    id: "measurement",
    title: "Measurement Tools",
    content: [
      "Select the Ruler tool from the toolbar to measure distances. Click two points on the canvas to see the distance in your chosen unit.",
      "Switch between feet, meters, and inches in the Units dropdown in the top-right settings panel.",
      "Use the Area tool to measure enclosed regions — click to place vertices and double-click to close the polygon.",
      "All measurements are calibrated against the document's embedded scale. Set a custom scale if your document lacks one.",
    ],
  },
  {
    id: "ai-chat",
    title: "Navigator AI Chat",
    content: [
      "Click the AI Chat icon (bottom-right) to open the Navigator assistant panel.",
      "Ask questions about the document in plain English: \"Where is the electrical panel?\", \"Show me all fire exits.\"",
      "The AI reads the current page by default. Prefix with \"full document:\" to search across all pages.",
      "Chat history is preserved for your session. Click the trash icon to clear and start a new conversation.",
    ],
  },
  {
    id: "document-tools",
    title: "Document Tools",
    content: [
      "Annotate documents using the pen, highlight, and text tools in the left toolbar.",
      "Annotations are saved automatically and visible only to your account.",
      "Export an annotated PDF using File → Export → Annotated PDF.",
      "Use the Compare tool to overlay two versions of a document and highlight differences.",
    ],
  },
  {
    id: "best-practices",
    title: "Best Practices",
    content: [
      "For fastest load times, flatten your PDF before uploading — avoid embedded 3D objects or multimedia.",
      "Keep individual file sizes under 200 MB. Larger files can be split by page range before upload.",
      "Use descriptive file names; Footprint Navigator indexes the filename for search.",
      "For CAD files, export to PDF at 300 DPI or higher for accurate measurement results.",
    ],
  },
  {
    id: "known-limitations",
    title: "Known Limitations (Demo)",
    content: [
      "The demo environment supports files up to 50 MB and a maximum of 50 pages.",
      "AI Chat responses may take 10–20 seconds on first query while the model warms up.",
      "Measurement calibration is not available for scanned documents without embedded metadata.",
      "Annotations made during the demo period are not guaranteed to persist beyond 7 days.",
      "Multi-user collaboration is disabled in the demo. Full access includes real-time co-editing.",
    ],
  },
];

const CATEGORIES = [
  "General Question",
  "Bug Report",
  "Feature Request",
  "Billing",
  "Account Access",
  "Document Upload",
  "Measurement Tools",
  "AI Chat",
  "Other",
];

export default function Support() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    description: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("https://footprint-api.onrender.com/api/support-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 md:px-8 py-16 max-w-4xl">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold mb-3">Support Center</h1>
          <p className="text-muted-foreground text-lg mb-12">
            Everything you need to get the most out of Footprint Navigator.
          </p>
        </motion.div>

        {SECTIONS.map((section, i) => (
          <motion.section
            key={section.id}
            id={section.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="mb-12"
          >
            <h2
              className="text-xl font-semibold mb-4 pb-2"
              style={{ borderBottom: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" }}
            >
              {section.title}
            </h2>
            <ul className="space-y-3">
              {section.content.map((item, j) => (
                <li key={j} className="flex gap-3 text-muted-foreground leading-relaxed">
                  <span style={{ color: "hsl(var(--primary))", fontWeight: 600, flexShrink: 0 }}>·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        ))}

        <motion.section
          id="support-ticket"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: SECTIONS.length * 0.04 }}
          className="mb-12"
        >
          <h2
            className="text-xl font-semibold mb-4 pb-2"
            style={{ borderBottom: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" }}
          >
            Support Ticket Form
          </h2>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg p-8 text-center"
              style={{ border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }}
            >
              <p className="text-lg font-semibold mb-2" style={{ color: "hsl(var(--primary))" }}>
                Thank you — we have received your request and will respond within 1 business day.
              </p>
              <p className="text-muted-foreground">
                If your report leads to a bug fix we will credit your account.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    name="firstName"
                    placeholder="Jane"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    className="bg-background"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    name="lastName"
                    placeholder="Smith"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Work Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="bg-background"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="" disabled>Select a category…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  name="subject"
                  placeholder="Brief summary of your issue"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="bg-background"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  placeholder="Describe your issue in detail — steps to reproduce, what you expected, and what happened."
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
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
                {isSubmitting ? "Submitting…" : "Submit Support Ticket"}
              </Button>

              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                If your support request leads to our team fixing a bug, we will deduct it from your monthly bill as a thank you.
              </p>
            </form>
          )}
        </motion.section>
      </div>
    </div>
  );
}
