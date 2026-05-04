import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/demo", label: "Demo" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home-logo">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary font-bold text-primary-foreground" aria-label="Footprint Logo">
            FP
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">Footprint Navigator</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:items-center md:gap-6 lg:gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid={`link-nav-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild data-testid="button-nav-login">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild data-testid="button-nav-signup">
              <Link href="/signup">Sign Up</Link>
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" asChild data-testid="button-nav-demo">
              <Link href="/demo">Try Demo</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
          data-testid="button-mobile-menu-toggle"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border/40 bg-background px-4 py-4 space-y-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-muted-foreground hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-4 border-t border-border/40">
            <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setIsMobileMenuOpen(false)}>
              <Link href="/login">Log In</Link>
            </Button>
            <Button className="w-full justify-start" asChild onClick={() => setIsMobileMenuOpen(false)}>
              <Link href="/signup">Sign Up</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start border-primary text-primary" asChild onClick={() => setIsMobileMenuOpen(false)}>
              <Link href="/demo">Try Demo</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
