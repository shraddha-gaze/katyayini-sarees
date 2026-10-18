import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { to: "/", label: "Home" },
  { to: "/sarees", label: "Catalogue" },
  { to: "/guide", label: "Saree Guide" },
];

export default function Header() {
  const { cartCount, wishlist } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    navigate(`/sarees?q=${encodeURIComponent(q.trim())}`);
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `uppercase tracking-widest2 text-xs lg:text-sm transition hover:text-sindoor ${isActive ? "text-sindoor" : "text-ink"}`;

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      <div className="zigzag-border" />
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <button className="md:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === "/"} className={navClass}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <Link to="/" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3" aria-label="Katyayini home">
          <img src="/logo.svg" alt="" className="h-11 w-11 sm:h-14 sm:w-14" width="56" height="56" />
          <span className="hidden font-serif text-2xl text-sindoor sm:inline sm:text-3xl">Katyayini</span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-5">
          <button aria-label="Search" onClick={() => setSearchOpen((s) => !s)}>
            <Search className="h-6 w-6" />
          </button>
          <Link to="/wishlist" aria-label="Wishlist" className="relative hidden sm:block">
            <Heart className="h-6 w-6" />
            {mounted && wishlist.length > 0 && <Badge n={wishlist.length} />}
          </Link>
          <Link to={user ? (user.profile.role === "admin" ? "/admin" : "/account") : "/login"} aria-label="Account" className="hidden sm:block">
            <User className="h-6 w-6" />
          </Link>
          <Link to="/cart" aria-label="Shopping bag" className="relative">
            <ShoppingBag className="h-6 w-6" />
            {mounted && cartCount > 0 && <Badge n={cartCount} />}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submitSearch} className="border-t border-ink/10 bg-cream-light">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <Search className="h-5 w-5 text-ink-soft" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Katan, organza, red bridal…"
              className="flex-1 bg-transparent py-2 focus:outline-none"
            />
            <button type="submit" className="btn-maroon px-4 py-2">Search</button>
          </div>
        </form>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="h-full w-72 bg-cream p-6" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="mb-8">
              <X className="h-6 w-6" />
            </button>
            <nav className="flex flex-col gap-6" onClick={() => setMenuOpen(false)}>
              {nav.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.to === "/"} className={navClass}>
                  {n.label}
                </NavLink>
              ))}
              <NavLink to="/wishlist" className={navClass}>Wishlist</NavLink>
              <NavLink to={user ? "/account" : "/login"} className={navClass}>{user ? "My Account" : "Sign in"}</NavLink>
              {user?.profile.role === "admin" && <NavLink to="/admin" className={navClass}>Admin</NavLink>}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-sindoor px-1 text-[10px] font-semibold text-cream-light">
      {n}
    </span>
  );
}
