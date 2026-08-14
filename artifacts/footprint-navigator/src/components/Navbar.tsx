import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
const logoSrc = "/FootprintLogo.png";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: "/features", label: "Features" },
    { href: "/demo", label: "Demo" },
    { href: "/signup", label: "Signup" },
    { href: "/security", label: "Security" },
    { href: "/support", label: "Support" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-[1000] border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home-logo">
          <img
            src={logoSrc}
            alt="Footprint Navigator Logo"
            style={{ height: "40px", width: "auto" }}
            data-testid="img-logo-navbar"
          />
          <span className="text-lg font-bold tracking-tight text-foreground">Footprint Navigator</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:items-center md:gap-8">
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
          <a
            href="https://app.footprintnavigator.com"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            data-testid="link-nav-login"
          >
            Login
          </a>
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
              data-testid={`link-mobile-nav-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://app.footprintnavigator.com"
            className="block text-sm font-medium text-muted-foreground hover:text-primary"
            onClick={() => setIsMobileMenuOpen(false)}
            data-testid="link-mobile-nav-login"
          >
            Login
          </a>
        </div>
      )}
    </nav>
  );
}
