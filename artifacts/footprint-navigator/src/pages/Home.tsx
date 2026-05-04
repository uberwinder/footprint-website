import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FileSearch, Layers, Zap, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 lg:py-48 overflow-hidden bg-background">
        {/* Abstract blueprint grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            AI-Powered Document Intelligence
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mb-6 leading-tight"
          >
            Navigate Every Document. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Execute Every Decision.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
          >
            Footprint Navigator transforms document chaos into confident decision-making. Find critical information across RFIs, submittals, specs, and drawings instantly. Tread boldly.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Button size="lg" className="h-12 px-8 text-base" asChild data-testid="button-hero-demo">
              <Link href="/demo">Try Demo</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base border-primary/50 hover:bg-primary/10" asChild data-testid="button-hero-signup">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="w-full py-16 bg-card border-y border-border/40">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">73%</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Reduction in RFI Time</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">$2B+</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Project Value</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">10k+</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Documents Navigated Daily</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">Top 50</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Trusted by Leading GCs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="w-full py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Precision software for construction professionals</h2>
            <p className="text-muted-foreground text-lg">
              Ingest massive project libraries and make every piece of information instantly searchable, cross-referenceable, and actionable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl border border-border/50 transition-all hover:border-primary/50">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <FileSearch className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Search</h3>
              <p className="text-muted-foreground leading-relaxed">
                Find any clause, detail, or requirement across thousands of documents in seconds, not hours. Stop flipping through physical binders.
              </p>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-border/50 transition-all hover:border-primary/50">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Layers className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Cross-Document Intelligence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automatically surface conflicts, dependencies, and related sections across your entire document library before they become change orders.
              </p>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-border/50 transition-all hover:border-primary/50">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Zap className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">RFI Acceleration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate draft RFIs pre-populated with relevant spec sections and drawing references to get answers faster and keep the project moving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 bg-card relative overflow-hidden border-t border-border/40">
        <div className="absolute right-0 bottom-0 -z-10 h-[300px] w-[300px] rounded-full bg-primary opacity-10 blur-[80px]"></div>
        <div className="container mx-auto px-4 md:px-8 text-center max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Stop searching. Start executing.</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join the leading project teams who rely on Footprint Navigator to eliminate document friction and reduce risk.
          </p>
          <Button size="lg" className="h-14 px-10 text-lg" asChild data-testid="button-bottom-signup">
            <Link href="/signup">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
