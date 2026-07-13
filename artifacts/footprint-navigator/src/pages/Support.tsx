import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Category = "Bug Report" | "Feature Request" | "General Question" | "Billing";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  description: string;
  category: Category;
}

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  subject: "",
  description: "",
  category: "General Question",
};

function Shortcut({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-start gap-4 py-2">
      <span className="font-mono text-sm bg-background border border-border/60 px-2 py-1 rounded text-primary whitespace-nowrap min-w-[160px]">
        {keys}
      </span>
      <span className="text-muted-foreground text-sm leading-relaxed pt-1">{label}</span>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-muted-foreground leading-relaxed">
      <span className="text-primary mt-1 shrink-0">·</span>
      <span>{children}</span>
    </li>
  );
}

function SupportForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
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

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="text-primary" size={32} />
        </div>
        <h3 className="text-2xl font-bold mb-4">Request Received</h3>
        <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
          Thank you — we have received your request and will respond within 1 business day. If your report leads to a bug fix, we will credit your account.
        </p>
        <Button className="mt-8" variant="outline" onClick={() => { setIsSuccess(false); setForm(EMPTY_FORM); }}>
          Submit Another Request
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">First Name <span className="text-primary">*</span></label>
          <Input placeholder="Jane" value={form.firstName} onChange={set("firstName")} required className="bg-background" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Last Name <span className="text-primary">*</span></label>
          <Input placeholder="Smith" value={form.lastName} onChange={set("lastName")} required className="bg-background" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Work Email <span className="text-primary">*</span></label>
        <Input type="email" placeholder="jane@company.com" value={form.email} onChange={set("email")} required className="bg-background" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Category <span className="text-primary">*</span></label>
        <div className="relative">
          <select
            value={form.category}
            onChange={set("category")}
            required
            className="w-full h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option>Bug Report</option>
            <option>Feature Request</option>
            <option>General Question</option>
            <option>Billing</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Subject <span className="text-primary">*</span></label>
        <Input placeholder="Brief description of your issue" value={form.subject} onChange={set("subject")} required className="bg-background" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Description <span className="text-primary">*</span></label>
        <Textarea
          placeholder="Please describe the issue in detail — what you were doing, what happened, and what you expected to happen."
          value={form.description}
          onChange={set("description")}
          required
          rows={6}
          className="bg-background resize-none"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send Support Request"}
      </Button>
      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        If your support request leads to our team fixing a bug, we will deduct it from your monthly bill as a thank you.
      </p>
    </form>
  );
}

interface SectionDef {
  id: string;
  title: string;
  searchText: string;
  content: React.ReactNode;
}

const SECTIONS: SectionDef[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    searchText: "getting started upload document pdf viewer thumbnails navigating pages recommended use cases construction drawings legal insurance technical manuals",
    content: (
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Footprint Navigator is an AI-powered PDF viewer designed for large, complex document sets — construction drawings, legal documents, insurance files, technical manuals, and any large PDF where finding information quickly matters.
        </p>
        <p>
          <span className="text-foreground font-medium">Uploading a document:</span> Click the upload button or drag a PDF into the viewer. During the testing period, files up to 500MB are supported. Once uploaded, the viewer opens automatically, page thumbnails populate in the panel, and the full text is indexed in the background for search and AI queries.
        </p>
        <p>
          <span className="text-foreground font-medium">Navigating pages:</span> Use the toolbar at the top, click any thumbnail in the left panel, or use keyboard shortcuts. The viewer supports split-screen views for comparing pages side by side.
        </p>
        <p className="font-medium text-foreground">Recommended use cases:</p>
        <ul className="space-y-1 pl-2">
          <Li>Construction drawing sets and specification books</Li>
          <Li>Legal documents and contracts</Li>
          <Li>Insurance policy files</Li>
          <Li>Technical manuals and data sheets</Li>
          <Li>Any large PDF where search and navigation matter</Li>
        </ul>
      </div>
    ),
  },
  {
    id: "navigating",
    title: "Navigating Your Document",
    searchText: "navigating document thumbnail panel sheet numbers keyboard shortcuts zoom pan split view blue white gray color coding",
    content: (
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <div>
          <p className="text-foreground font-medium mb-2">Thumbnail panel</p>
          <p>
            The left panel shows a thumbnail for every page. Navigator auto-detects sheet numbers from title blocks and displays them as labels. Color coding indicates the source:
          </p>
          <ul className="space-y-1 pl-2 mt-2">
            <Li><span className="text-blue-400 font-medium">Blue</span> — sheet number detected automatically</Li>
            <Li><span className="text-white font-medium">White</span> — manually entered by you</Li>
            <Li><span className="text-gray-400 font-medium">Gray</span> — fallback when no number was found</Li>
          </ul>
          <p className="mt-2">To correct a wrong sheet number, click the label directly on the thumbnail and type the correct value.</p>
        </div>
        <div>
          <p className="text-foreground font-medium mb-3">Keyboard shortcuts</p>
          <div className="divide-y divide-border/30">
            <Shortcut keys="Ctrl + Left / Right" label="Previous / next page" />
            <Shortcut keys="Ctrl + Home" label="Jump to first page" />
            <Shortcut keys="Ctrl + End" label="Jump to last page" />
            <Shortcut keys="Alt + Left / Right" label="Previous / next view in history" />
            <Shortcut keys="F11" label="Toggle full screen" />
            <Shortcut keys="Ctrl + 2" label="Split view — vertical" />
            <Shortcut keys="Ctrl + H" label="Split view — horizontal" />
          </div>
        </div>
        <p>
          <span className="text-foreground font-medium">Zoom and pan:</span> Use the toolbar zoom controls or pinch-to-zoom on touch screens. Click and drag to pan around a zoomed page.
        </p>
      </div>
    ),
  },
  {
    id: "search",
    title: "Searching Your Document",
    searchText: "searching search ctrl+f keywords results text extracted scanned OCR phrase partial terms spec section numbers sheet numbers room names",
    content: (
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Open search with <span className="font-mono text-sm text-primary bg-background border border-border/60 px-1.5 py-0.5 rounded">Ctrl+F</span> or the search bar in the toolbar. Navigator searches all extracted text across every page of your document and returns results instantly.
        </p>
        <p>Click any result to jump directly to that page.</p>
        <p className="text-foreground font-medium">Best practices for effective searching:</p>
        <ul className="space-y-1 pl-2">
          <Li>Use specific keywords — spec section numbers, sheet numbers, room names, product model numbers, clause references</Li>
          <Li>Search for exact phrases when you know the wording</Li>
          <Li>Use partial terms to catch variations (e.g. "HVAC" will find "HVAC unit", "HVAC system", etc.)</Li>
        </ul>
        <p className="text-sm text-muted-foreground border border-border/40 rounded-lg px-4 py-3 bg-card">
          <span className="text-foreground font-medium">Limitation:</span> Search works best on text-based PDFs. Fully scanned image PDFs have limited search accuracy since the text must be extracted via OCR, which may introduce errors.
        </p>
      </div>
    ),
  },
  {
    id: "measurement",
    title: "Measurement Tools",
    searchText: "measurement tools scale calibrate length area perimeter angle polygon CSV export snap F3 zoom accuracy drawing",
    content: (
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <div>
          <p className="text-foreground font-medium mb-2">Setting the scale — do this first</p>
          <p>
            Measurements are only accurate when the scale is calibrated. To set scale: select the Scale tool, click two points whose real-world distance you know (e.g. a dimension line), then enter the actual distance. Scale is saved per page for the current session.
          </p>
        </div>
        <div>
          <p className="text-foreground font-medium mb-3">Measurement tools</p>
          <div className="divide-y divide-border/30">
            <Shortcut keys="L" label="Length — measure a straight line between two points" />
            <Shortcut keys="A" label="Area — draw a polygon, get the enclosed area" />
            <Shortcut keys="P" label="Perimeter — measure the total boundary of a shape" />
            <Shortcut keys="G" label="Angle — measure the angle between two lines" />
          </div>
        </div>
        <ul className="space-y-1 pl-2">
          <Li>All measurements anchor to their page and stay visible when you return to that page</Li>
          <Li>Export all measurements to CSV using the Export button in the measurement toolbar</Li>
          <Li>Toggle snap-to-content with <span className="font-mono text-sm text-primary bg-background border border-border/60 px-1.5 py-0.5 rounded">F3</span> for precision alignment to drawing lines</Li>
          <Li>For best accuracy, zoom in before placing measurement points</Li>
          <Li>Always set scale on each page independently — scale often varies between sheets</Li>
        </ul>
      </div>
    ),
  },
  {
    id: "ai-chat",
    title: "Navigator AI Chat",
    searchText: "AI chat panel question answer document free balanced best model memory session follow-up construction gear settings bug report",
    content: (
      <div className="space-y-5 text-muted-foreground leading-relaxed">
        <p>
          Open the chat panel from the toolbar or side panel icon. Navigator AI can answer questions about your document, questions about how to use the app, and general construction workflow questions.
        </p>
        <p>
          The conversation maintains full memory within a session, so follow-up questions work naturally — "What does that section say about fire-rated assemblies?" followed by "What page is that on?" will work as expected.
        </p>
        <div>
          <p className="text-foreground font-medium mb-3">The three AI modes</p>
          <div className="space-y-3">
            <div className="rounded-lg border border-border/40 bg-card px-4 py-3">
              <p className="font-medium text-white mb-1">Free</p>
              <p className="text-sm">Fast responses, best for simple navigation questions and quick lookups. Ideal when you need a quick answer and speed matters.</p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
              <p className="font-medium text-white mb-1">Balanced</p>
              <p className="text-sm">Better accuracy for detailed lookups across multiple sections. A good default for most document questions.</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-card px-4 py-3">
              <p className="font-medium text-white mb-1">Best</p>
              <p className="text-sm">Maximum reasoning depth for complex questions — comparing sections, synthesizing information across many pages, or analyzing conflicting requirements.</p>
            </div>
          </div>
        </div>
        <p className="text-foreground font-medium">Example questions that work well:</p>
        <ul className="space-y-1 pl-2">
          <Li>"What is the specified concrete compressive strength for the foundation?"</Li>
          <Li>"Find all references to waterproofing in Division 7"</Li>
          <Li>"What are the egress requirements mentioned in this document?"</Li>
          <Li>"Summarize what Section 09 says about flooring"</Li>
        </ul>
        <p>
          Access chat settings (model selection, context options) from the gear icon inside the chat panel. To report a bug directly, type "report a bug" in chat and Navigator will guide you through it.
        </p>
      </div>
    ),
  },
  {
    id: "document-tools",
    title: "Document Tools",
    searchText: "document tools properties rotate delete insert blank extract pages number stamp metadata font author creation date",
    content: (
      <div className="space-y-5 text-muted-foreground leading-relaxed">
        <p>All document tools are accessible from the <span className="text-foreground font-medium">Document</span> menu in the top toolbar.</p>
        <div className="divide-y divide-border/30 space-y-0">
          {[
            {
              label: "Document Properties",
              shortcut: "Ctrl+D",
              desc: "View file metadata including page count, file size, PDF version, author, creation date, and embedded font information.",
            },
            {
              label: "Rotate Pages",
              shortcut: null,
              desc: "Rotate one page or a range of pages. Useful when a drawing or scan was captured in the wrong orientation.",
            },
            {
              label: "Delete Pages",
              shortcut: null,
              desc: "Remove a page or range of pages from the document. This action cannot be undone — make sure you have a copy before deleting.",
            },
            {
              label: "Insert Blank Page",
              shortcut: null,
              desc: "Insert a blank page at any position with custom dimensions. Useful for adding notes or separator pages.",
            },
            {
              label: "Extract Pages",
              shortcut: null,
              desc: "Select a range of pages to extract and download as a separate PDF file.",
            },
            {
              label: "Number Pages",
              shortcut: null,
              desc: "Stamp page numbers onto pages with custom formatting — choose position, font size, prefix text, and starting number.",
            },
          ].map((tool) => (
            <div key={tool.label} className="py-4">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-foreground font-medium">{tool.label}</span>
                {tool.shortcut && (
                  <span className="font-mono text-xs text-primary bg-background border border-border/60 px-1.5 py-0.5 rounded">
                    {tool.shortcut}
                  </span>
                )}
              </div>
              <p className="text-sm">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "best-practices",
    title: "Best Practices",
    searchText: "best practices text-based PDF scanned OCR scale measurement keywords search AI mode best free corrections thumbnails export CSV large drawing sets",
    content: (
      <ul className="space-y-3 text-muted-foreground leading-relaxed pl-2">
        <Li>Use text-based PDFs for the best search and AI results — scanned image PDFs have reduced accuracy</Li>
        <Li>Set the scale on each page before taking measurements — scales often differ between sheets</Li>
        <Li>Use specific keywords when searching: spec section numbers, sheet numbers, room names, product codes, clause numbers</Li>
        <Li>Use <span className="text-white font-medium">Best</span> AI mode for complex analysis like comparing sections or finding conflicts</Li>
        <Li>Use <span className="text-white font-medium">Free</span> mode for quick navigation questions where speed matters</Li>
        <Li>Correct wrong sheet numbers by clicking the thumbnail label directly</Li>
        <Li>Export measurements to CSV before closing a session — persistent storage is not yet available, measurements will be lost on close</Li>
        <Li>For large drawing sets (100+ pages), allow a few seconds after upload for the full index to complete before searching</Li>
      </ul>
    ),
  },
  {
    id: "known-limitations",
    title: "Known Limitations (Demo)",
    searchText: "known limitations demo count tool persistent storage measurements session CSV scanned image OCR file size 500MB browser Chrome",
    content: (
      <div>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Footprint Navigator is currently in limited beta testing. We're being transparent about what's still in development:
        </p>
        <ul className="space-y-3 text-muted-foreground leading-relaxed pl-2">
          <Li>The <span className="text-white font-medium">Count tool</span> is visible in the toolbar but not yet functional</Li>
          <Li>Documents must be re-uploaded each session — persistent document storage is in development</Li>
          <Li>Measurements are session-only — export to CSV before closing if you need to save them</Li>
          <Li>Scanned image PDFs have limited search and AI accuracy due to OCR constraints</Li>
          <Li>File size limit during testing is 500MB</Li>
          <Li>Some features may behave differently across browsers — Chrome is recommended for best results</Li>
        </ul>
      </div>
    ),
  },
  {
    id: "need-help",
    title: "Need More Help?",
    searchText: "need help support ticket bug report feature request billing contact email send request",
    content: (
      <div>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Our team reads every support request. If your report leads to our team fixing a bug, we will credit your monthly bill as a thank you.
        </p>
        <div className="bg-background border border-border/50 rounded-2xl p-8 md:p-10">
          <SupportForm />
        </div>
      </div>
    ),
  },
];

export default function Support() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? SECTIONS.filter(
        (s) =>
          s.title.toLowerCase().includes(normalized) ||
          s.searchText.toLowerCase().includes(normalized)
      )
    : SECTIONS;

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero */}
      <section className="relative w-full py-20 md:py-28 overflow-hidden bg-background border-b border-border/40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 h-[260px] w-[260px] rounded-full bg-primary opacity-20 blur-[100px]" />
        <div className="container relative z-10 mx-auto px-4 md:px-8 text-center max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6"
          >
            Footprint Navigator{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Support
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground"
          >
            Everything you need to get the most out of Navigator. Can't find what you need? We're here to help.
          </motion.p>
        </div>
      </section>

      {/* Search Bar */}
      <div className="bg-background border-b border-border/40 sticky top-16 z-40">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenId(null);
              }}
              placeholder="Search support topics..."
              className="w-full h-10 rounded-md border border-border/60 bg-card pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setOpenId(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="bg-background flex-1">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl py-6">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No results found for{" "}
              <span className="text-foreground font-medium">"{query}"</span>
              {" "}— email us at{" "}
              <a href="mailto:info@footprintnavigator.com" className="text-primary hover:underline">
                info@footprintnavigator.com
              </a>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filtered.map((section) => {
                const isOpen = openId === section.id;
                return (
                  <div key={section.id}>
                    <button
                      onClick={() => toggle(section.id)}
                      className="w-full flex items-center justify-between py-5 text-left hover:bg-white/[0.03] rounded-sm transition-colors px-1 -mx-1"
                    >
                      <span className="text-lg font-semibold text-foreground">{section.title}</span>
                      <ChevronDown
                        size={18}
                        className="text-muted-foreground shrink-0 ml-4 transition-transform duration-200"
                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="pb-8 pt-2 px-1">
                            {section.content}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
