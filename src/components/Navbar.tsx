import { Link } from "react-router-dom";
import { Crown, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { categories } from "@/data/mockData";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 md:px-8 h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-display text-gradient-gold tracking-wider">
            STREAMVIP
          </span>
        </Link>

        {/* Desktop Categories */}
        <div className="hidden md:flex items-center gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categoria/${cat.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Button size="sm" className="hidden sm:flex bg-gradient-vip text-accent-foreground hover:opacity-90 shadow-gold">
            <Crown className="w-4 h-4 mr-1.5" />
            Seja VIP
          </Button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 pb-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categoria/${cat.slug}`}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Button size="sm" className="w-full mt-3 bg-gradient-vip text-accent-foreground">
            <Crown className="w-4 h-4 mr-1.5" />
            Seja VIP
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
