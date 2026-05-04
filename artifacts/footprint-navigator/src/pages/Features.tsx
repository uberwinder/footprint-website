import { motion } from "framer-motion";
import { CheckCircle2, Shield, Users, Database, Zap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Features() {
  const features = [
    {
      title: "AI-Powered Search",
      description: "Find any clause, detail, or requirement across thousands of documents in seconds. Natural language processing understands construction terminology context.",
      icon: <Zap className="text-primary" size={24} />
    },
    {
      title: "Cross-Document Intelligence",
      description: "Automatically surface conflicts, dependencies, and related sections across your entire document library. Catch spec conflicts before they become change orders.",
      icon: <Database className="text-primary" size={24} />
    },
    {
      title: "RFI Acceleration",
      description: "Generate draft RFIs pre-populated with relevant spec sections and drawing references. Track responses and automatically link them back to the source documents.",
      icon: <FileText className="text-primary" size={24} />
    },
    {
      title: "Role-Based Views",
      description: "Custom dashboards for PMs, supers, estimators, and owners. Everyone sees the information most critical to their specific responsibilities.",
      icon: <Users className="text-primary" size={24} />
    },
    {
      title: "Audit-Ready History",
      description: "Complete version history and change tracking for every document. Always know who viewed what, when, and what changed between revisions.",
      icon: <Shield className="text-primary" size={24} />
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
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
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
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, predictable pricing</h2>
            <p className="text-muted-foreground text-lg">
              Choose the plan that fits your project portfolio. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-card border border-border/50 rounded-2xl p-8 flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-muted-foreground mb-6">For small teams and specific projects.</p>
              <div className="mb-8">
                <span className="text-4xl font-bold">$299</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary" size={20} />
                  <span>Up to 5 users</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary" size={20} />
                  <span>50GB document storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary" size={20} />
                  <span>Core search + navigation</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>

            {/* Professional Plan (Highlighted) */}
            <div className="bg-card border-2 border-primary rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_-15px_rgba(0,123,255,0.3)]">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <p className="text-muted-foreground mb-6">For growing teams managing complex builds.</p>
              <div className="mb-8">
                <span className="text-4xl font-bold">$799</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary" size={20} />
                  <span>Up to 25 users</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary" size={20} />
                  <span>500GB document storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary" size={20} />
                  <span>Advanced AI intelligence</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary" size={20} />
                  <span>RFI acceleration tools</span>
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-card border border-border/50 rounded-2xl p-8 flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-muted-foreground mb-6">For ENR Top 400 GCs and large owners.</p>
              <div className="mb-8">
                <span className="text-4xl font-bold">Custom</span>
                <span className="text-muted-foreground"> pricing</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary" size={20} />
                  <span>Unlimited users</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary" size={20} />
                  <span>Unlimited storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary" size={20} />
                  <span>Dedicated success manager</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary" size={20} />
                  <span>SSO & Custom integrations</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
