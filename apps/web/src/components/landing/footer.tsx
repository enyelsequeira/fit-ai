import { Dumbbell } from "lucide-react";

const footerLinks = [
  { label: "About", href: "#" },
  { label: "Features", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Logo and brand */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <Dumbbell className="h-4 w-4 text-purple-400" />
            </div>
            <span className="font-semibold">Fit AI</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Tech stack */}
          <p className="text-muted-foreground text-xs">Built with TanStack + oRPC + AI</p>
        </div>

        {/* Copyright */}
        <div className="text-muted-foreground mt-6 border-t border-white/5 pt-6 text-center text-xs">
          &copy; {new Date().getFullYear()} Fit AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
