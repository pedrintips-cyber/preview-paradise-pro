import { Link } from "react-router-dom";
import { Crown, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { categories } from "@/data/mockData";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 md:px-8 h-14">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-display text-primary tracking-wider">
            STREAMVIP
          </span>
        </Link>

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

        <div className="flex items-center gap-2">
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Link to="/vip">
            <Button size="sm" className="hidden sm:flex bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-xs">
              <Crown className="w-3.5 h-3.5 mr-1" />
              Seja VIP
            </Button>
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 pb-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categoria/${cat.slug}`}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link to="/vip" onClick={() => setMenuOpen(false)}>
            <Button size="sm" className="w-full mt-3 bg-primary text-primary-foreground">
              <Crown className="w-3.5 h-3.5 mr-1" />
              Seja VIP
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
