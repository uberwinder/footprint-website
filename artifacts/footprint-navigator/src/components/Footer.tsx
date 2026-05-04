import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary font-bold text-primary-foreground">
                FP
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">Footprint Navigator</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Precision document intelligence for construction professionals. Navigate every document. Execute every decision.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/features#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/demo" className="hover:text-primary transition-colors">Interactive Demo</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><a href="mailto:info@footprintrobotics.com" className="hover:text-primary transition-colors">info@footprintrobotics.com</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2025 Footprint Technologies. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
