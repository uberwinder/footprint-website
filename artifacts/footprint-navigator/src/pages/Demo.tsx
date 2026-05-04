import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Demo() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <section className="py-20 container mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Experience Footprint Navigator</h1>
          <p className="text-xl text-muted-foreground">
            See how our AI-powered document intelligence transforms how construction teams manage information.
          </p>
        </div>

        {/* Video / Interactive Demo Placeholder */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-5xl mx-auto aspect-video bg-card rounded-2xl border border-border/50 overflow-hidden shadow-2xl flex items-center justify-center group cursor-pointer"
        >
          {/* Faux UI Header to make it look like an app window */}
          <div className="absolute top-0 left-0 right-0 h-12 border-b border-border/40 bg-background/50 flex items-center px-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>
            <div className="mx-auto bg-background border border-border rounded-md px-32 py-1 text-xs text-muted-foreground">
              app.footprintrobotics.com
            </div>
          </div>
          
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors z-10"></div>
          
          <div className="z-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-[0_0_30px_rgba(0,123,255,0.5)] mb-6 transform group-hover:scale-110 transition-transform">
              <PlayCircle size={40} className="ml-1" />
            </div>
            <h3 className="text-2xl font-bold text-white">Play Interactive Walkthrough</h3>
            <p className="text-muted-foreground mt-2">Duration: 3 mins</p>
          </div>
        </motion.div>

        {/* Next Steps */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold mb-6">Ready to try it with your own project data?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-12 px-8" asChild>
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8" asChild>
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
