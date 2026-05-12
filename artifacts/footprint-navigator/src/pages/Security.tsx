import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Link } from "wouter";

function Section({ alt, children }: { alt?: boolean; children: React.ReactNode }) {
  return (
    <section className={`w-full py-16 md:py-20 ${alt ? "bg-card border-y border-border/40" : "bg-background"}`}>
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        {children}
      </div>
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: "#007BFF" }}>
      {children}
    </h2>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-muted-foreground leading-relaxed">
      <span className="text-primary mt-1 shrink-0">·</span>
      <span>{children}</span>
    </li>
  );
}

export default function Security() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero */}
      <section className="relative w-full py-20 md:py-28 overflow-hidden bg-background border-b border-border/40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 h-[260px] w-[260px] rounded-full bg-primary opacity-20 blur-[100px]" />
        <div className="container relative z-10 mx-auto px-4 md:px-8 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center mb-6"
          >
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="text-primary" size={32} />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6"
          >
            Your Data{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Stays Yours
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground"
          >
            Here's exactly what happens to your project files when you use Footprint Navigator.
          </motion.p>
        </div>
      </section>

      {/* Section 1 — The Short Version */}
      <Section>
        <SectionTitle>The Short Version</SectionTitle>
        <div className="space-y-4 text-muted-foreground leading-relaxed text-base">
          <p>Your documents never leave your device. We never store your project files on our servers.</p>
          <p>When you ask a question, only a small snippet of relevant text is sent to the AI — not your documents, not your files.</p>
          <p>We do not train AI models on your data.</p>
        </div>
      </Section>

      {/* Section 2 — How It Works */}
      <Section alt>
        <SectionTitle>What actually happens when you use the app</SectionTitle>
        <ul className="space-y-4">
          <Li>
            Document rendering runs entirely in your browser. Your files are never uploaded to Footprint servers. They stay on your device.
          </Li>
          <Li>
            When you ask Navigator a question, the app finds the most relevant text from your document and sends only that excerpt to the AI — a few sentences, not your files.
          </Li>
          <Li>
            The AI reads that excerpt, answers your question, and the excerpt is discarded. Nothing is stored.
          </Li>
          <Li>
            When you close the app, your project data is gone. We have no copy of it.
          </Li>
        </ul>
      </Section>

      {/* Section 3 — What Does Leave Your Device */}
      <Section>
        <SectionTitle>In the interest of full transparency</SectionTitle>
        <ul className="space-y-4">
          <Li>
            Small text excerpts — never full documents or images — sent to AI APIs when you ask a question. These are discarded after the response.
          </Li>
          <Li>
            Bug reports and feedback you manually choose to submit.
          </Li>
          <Li>
            Nothing else.
          </Li>
        </ul>
      </Section>

      {/* Section 4 — AI Providers */}
      <Section alt>
        <SectionTitle>Which AI services process your queries</SectionTitle>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Your questions are routed through enterprise AI APIs — not consumer AI products. These providers operate under strict enterprise data terms:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {["Google Gemini API", "Groq API", "Anthropic Claude API", "OpenAI API"].map((provider) => (
              <div
                key={provider}
                className="rounded-lg border border-border/50 bg-card px-4 py-3 text-sm font-medium text-foreground"
              >
                {provider}
              </div>
            ))}
          </div>
          <p>
            None of these providers use API inputs to train their models. Text excerpts are processed and discarded — not retained, not learned from.
          </p>
          <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
            This is meaningfully different from using ChatGPT, Google Gemini, or Claude.ai directly, where consumer data policies apply.
          </p>
        </div>
      </Section>

      {/* Section 5 — Sensitive Projects */}
      <Section>
        <SectionTitle>Have stricter data requirements?</SectionTitle>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            For organizations with heightened data controls — government contracts, proprietary designs, NDA-governed documents — a self-hosted deployment of Footprint Navigator with fully local AI (zero external API calls) is on our roadmap.
          </p>
          <p>
            Contact us to discuss:{" "}
            <a href="mailto:info@footprintnavigator.com" className="text-primary hover:underline">
              info@footprintnavigator.com
            </a>
          </p>
        </div>
      </Section>

      {/* Section 6 — Questions */}
      <Section alt>
        <SectionTitle>Questions about data security?</SectionTitle>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            We're happy to answer direct questions about our architecture, data handling, or enterprise deployment options.
          </p>
          <div className="space-y-1">
            <p>
              <span className="text-foreground font-medium">Email: </span>
              <a href="mailto:info@footprintnavigator.com" className="text-primary hover:underline">
                info@footprintnavigator.com
              </a>
            </p>
            <p>
              <span className="text-foreground font-medium">Response time: </span>within 1 business day.
            </p>
          </div>
        </div>
      </Section>

    </div>
  );
}
