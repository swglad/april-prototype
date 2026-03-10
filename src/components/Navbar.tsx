import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { theme } from "@/theme/config";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Our Mission", to: "/mission" },
  { label: "Our Team", to: "/team" },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to: string) => {
    if (to.startsWith("/#")) return location.pathname === "/" && location.hash === to.slice(1);
    return location.pathname === to;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={theme.logo.src}
            alt={theme.logo.alt}
            width={theme.logo.width}
            height={theme.logo.width}
            className="rounded-md"
          />
          <div className="hidden sm:block">
            <span className="font-heading text-xl font-bold text-secondary">
              {theme.brand.name}
            </span>
            <p className="text-xs text-muted-foreground font-body">
              {theme.brand.tagline}
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 text-sm font-body font-medium rounded-lg transition-colors ${
                isActive(link.to)
                  ? "text-secondary bg-secondary/10"
                  : "text-foreground/70 hover:text-secondary hover:bg-secondary/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/app" className="ml-2">
            <Button variant="nav" size="default">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4 pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-3 text-sm font-body font-medium rounded-lg transition-colors ${
                isActive(link.to)
                  ? "text-secondary bg-secondary/10"
                  : "text-foreground/70 hover:text-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/app" onClick={() => setMobileOpen(false)} className="block mt-2">
            <Button variant="nav" size="default" className="w-full">
              Get Started
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
