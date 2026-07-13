import { motion } from "framer-motion";
import { CheckCircle2, Shield, Users, Database, Zap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Features() {
  const features = [
    {
      title: "AI-Powered Search",
      description: "Find any clause, detail, or requirement across thousands of documents in seconds. Natural language processing understands construction terminology context.",
      icon: <Zap className="text-primary" size={24} />,
      comingSoon: false,
    },
    {
      title: "Cross-Document Intelligence",
      description: "Surface conflicts, dependencies, and related sections across your entire document library. Single document intelligence is live — multi-document support coming soon.",
      icon: <Database className="text-primary" size={24} />,
      comingSoon: false,
    },
    {
      title: "Workflow Integrations",
      description: "Connect Footprint Navigator to your existing tools. API-ready for email, project management platforms, Excel, and construction software. Automate document workflows without changing how your team works.",
      icon: <FileText className="text-primary" size={24} />,
      comingSoon: true,
    },
    {
      title: "Role-Based Views",
      description: "Custom dashboards for PMs, supers, estimators, and owners. Everyone sees the information most critical to their specific responsibilities.",
      icon: <Users className="text-primary" size={24} />,
      comingSoon: true,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="py-20 md:py-28 bg-background border-b border-border/40">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Powerful Features for <span className="text-primary">Complex Projects</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground"
          >
            Everything you need to master your project's documentation, from bidding to closeout.
          </motion.p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0 mt-1 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  {feature.icon}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                    {feature.comingSoon && (
                      <span
                        style={{ fontSize: "11px" }}
                        className="inline-flex items-center rounded-full border border-primary px-2 py-0.5 font-medium text-primary bg-transparent leading-none whitespace-nowrap"
                        data-testid={`badge-coming-soon-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-background border-t border-border/40">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">
              One plan. Everything included. No hidden fees.
            </p>
          </div>

          {/* Solo Plan */}
          <div className="bg-card border-2 border-primary rounded-2xl p-10 flex flex-col shadow-[0_0_50px_-15px_rgba(0,123,255,0.35)] mb-6" data-testid="card-plan-solo">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-bold">Solo</h3>
            </div>
            <p className="text-muted-foreground mb-6">Everything you need to navigate any document set.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold">$19</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                "AI-powered document search",
                "All measurement tools",
                "Multi-model AI (Groq, Claude, GPT-4o, Gemini)",
                "Unlimited documents",
                "Chat history and session memory",
                "Scale calibration and snap tools",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary flex-shrink-0" size={20} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full h-12 text-base" asChild data-testid="button-solo-signup">
              <Link href="/signup">Get Early Access</Link>
            </Button>
          </div>

          {/* Early Adopter Banner */}
          <div className="bg-[#1a1a1a] border border-primary rounded-2xl p-8 mb-6" data-testid="card-early-adopter">
            <p className="text-xl font-bold mb-3">Now in Limited Beta</p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Be part of something from the ground up. Early users who help us test and improve Footprint Navigator get free access and significant discounts locked in for life. If you join the beta and help us improve it, we take care of you.
            </p>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" asChild data-testid="button-early-access-contact">
              <Link href="/contact">Contact Us to Get Early Access</Link>
            </Button>
          </div>

          {/* Team Plan */}
          <div className="bg-card border border-border/50 rounded-2xl p-10 flex flex-col mb-8" data-testid="card-plan-team">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold">Team</h3>
              <span
                style={{ fontSize: "11px" }}
                className="inline-flex items-center rounded-full border border-primary px-2 py-0.5 font-medium text-primary bg-transparent leading-none whitespace-nowrap"
              >
                Coming Soon
              </span>
            </div>
            <p className="text-muted-foreground mb-6">Collaboration and shared workspaces for your whole team.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold">$29</span>
              <span className="text-muted-foreground">/user/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                "Everything in Solo",
                "Shared project workspaces",
                "Team chat history",
                "Role-based access",
                "Priority support",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="text-muted-foreground flex-shrink-0" size={20} />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full h-12 text-base opacity-50 cursor-not-allowed" asChild data-testid="button-team-notify">
              <Link href="/signup">Notify Me</Link>
            </Button>
          </div>

          {/* Enterprise line */}
          <p className="text-center text-muted-foreground text-sm">
            Need a custom solution for a large organization?{" "}
            <Link href="/contact" className="text-primary hover:underline" data-testid="link-enterprise-contact">
              Contact us
            </Link>{" "}
            for enterprise pricing.
          </p>
        </div>
      </section>
    </div>
  );
}
