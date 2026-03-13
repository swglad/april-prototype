import { Link } from "react-router-dom";
import { theme } from "@/theme/config";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Our Mission", to: "/mission" },
  { label: "Our Team", to: "/team" },
  { label: "Get Started", to: "/app" },
  { label: "Behind the Math", to: "/behind-the-math" },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={theme.logo.src}
                alt={theme.logo.alt}
                width={32}
                height={32}
                className="rounded-md"
              />
              <span className="font-heading text-lg font-bold text-secondary">
                {theme.brand.name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              {theme.brand.tagline}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground mb-3">
              Navigate
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm font-body text-muted-foreground hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="font-heading text-sm font-semibold text-foreground mb-3">
              Disclaimer
            </h4>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              {theme.brand.name} is an educational tool only. Outputs are estimates based
              on your inputs and do not constitute financial advice. Consult a licensed
              financial professional for personalized guidance.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground font-body">
            © {new Date().getFullYear()} {theme.brand.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
