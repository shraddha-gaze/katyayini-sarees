import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, LogOut, Package, ShoppingCart, Store, Users } from "lucide-react";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream-light">
      <Seo title="Admin" description="Katyayini admin" path="/admin" noindex />
      <div className="zigzag-border" />
      <div className="flex flex-col md:flex-row">
        <aside className="bg-sindoor-dark text-cream md:min-h-[calc(100vh-14px)] md:w-60">
          <Link to="/admin" className="flex items-center gap-3 px-5 py-5">
            <img src="/logo.svg" alt="" className="h-10 w-10" />
            <span className="font-serif text-2xl text-cream-light">Katyayini</span>
          </Link>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `flex shrink-0 items-center gap-3 px-3 py-2.5 text-sm ${isActive ? "bg-cream/15 text-cream-light" : "text-cream/75 hover:bg-cream/10"}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
            <Link to="/" className="flex shrink-0 items-center gap-3 px-3 py-2.5 text-sm text-cream/75 hover:bg-cream/10">
              <Store className="h-4 w-4" /> View store
            </Link>
            <button
              onClick={async () => { await signOut(); navigate("/admin/login"); }}
              className="flex shrink-0 items-center gap-3 px-3 py-2.5 text-left text-sm text-cream/75 hover:bg-cream/10"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
          <p className="hidden px-5 py-4 text-xs text-cream/50 md:block">{user?.email}</p>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
