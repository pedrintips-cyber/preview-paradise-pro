import { Link } from "react-router-dom";
import { Crown, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { categories } from "@/data/mockData";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-3 md:px-8 h-11 md:h-14">
        <Link to="/" className="flex items-center">
          <span className="text-lg md:text-2xl font-display text-primary tracking-wider">
            STREAMVIP
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-5">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/categoria/${cat.slug}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <Link to="/vip">
            <Button size="sm" className="hidden sm:flex bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-[9px] h-6 px-2">
              <Crown className="w-3 h-3 mr-0.5" />
              VIP
            </Button>
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1.5 text-muted-foreground hover:text-foreground">
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-card border-b border-border px-3 pb-3">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/categoria/${cat.slug}`} onClick={() => setMenuOpen(false)} className="block py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              {cat.name}
            </Link>
          ))}
          <Link to="/vip" onClick={() => setMenuOpen(false)}>
            <Button size="sm" className="w-full mt-2 bg-primary text-primary-foreground text-[10px] h-7">
              <Crown className="w-3 h-3 mr-1" />
              Seja VIP
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
